import { useMemo, useState } from 'react';
import { buildPoseidon } from 'circomlibjs';

type NavItem = 'dashboard' | 'organizations' | 'documents' | 'publications' | 'verification' | 'settings';

type NoirInput = {
  leaf: string;
  root: string;
  siblings: string[];
  indices: boolean[];
  message: string;
  publicKey: string;
  signature: string[];
};

type DocumentEntry = {
  documentId: number;
  filename: string;
  noirInput: NoirInput;
};

type AllInputsArtifact = {
  generatedAt: string;
  organizationName: string;
  registryName: string;
  description?: string;
  documentCount: number;
  depth: number;
  inputs: DocumentEntry[];
};

type SingleInputArtifact = {
  generatedAt: string;
  organizationName: string;
  registryName: string;
  description?: string;
  documentId: number;
  filename: string;
  leaf: string;
  root: string;
  siblings: string[];
  indices: boolean[];
  message: string;
  publicKey: string;
  signature: string[];
};

const navItems: Array<{ id: NavItem; label: string; hint: string }> = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Overview' },
  { id: 'organizations', label: 'Organizations', hint: 'Registry setup' },
  { id: 'documents', label: 'Documents', hint: 'Upload & manage' },
  { id: 'publications', label: 'Publications', hint: 'Publishing history' },
  { id: 'verification', label: 'Verification', hint: 'Public checks' },
  { id: 'settings', label: 'Settings', hint: 'Keys & preferences' },
];

const organizationOptions = [
  { id: 'afit', name: 'AFIT', registries: ['Admissions', 'Student Records', 'Research Publications'] },
  { id: 'waec', name: 'WAEC', registries: ['Certificate Registry', 'Examination Records'] },
  { id: 'microsoft', name: 'Microsoft', registries: ['Employment Records', 'Partner Certifications'] },
];

const GENERATOR = 7n;
const FIELD_MODULUS = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

function hexFromBuffer(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256Bytes(buffer: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return hexFromBuffer(digest);
}

function mod(value: bigint) {
  const remainder = value % FIELD_MODULUS;
  return remainder >= 0n ? remainder : remainder + FIELD_MODULUS;
}

export default function App() {
  const [activeView, setActiveView] = useState<NavItem>('dashboard');
  const [developerMode, setDeveloperMode] = useState(false);
  const [registryName, setRegistryName] = useState('AFIT Official Documents');
  const [organizationOptionsState, setOrganizationOptionsState] = useState(organizationOptions);
  const [organizationName, setOrganizationName] = useState('Africa Institute of Technology');
  const [description, setDescription] = useState('Official certificates and institutional documents published with cryptographic authenticity proofs.');
  const [selectedOrganization, setSelectedOrganization] = useState('afit');
  const [selectedRegistry, setSelectedRegistry] = useState('Admissions');
  const [proofFileName, setProofFileName] = useState('No file selected');
  const [documentFileName, setDocumentFileName] = useState('No file selected');
  const [proofInfo, setProofInfo] = useState('Upload a proof JSON file from the registry export pipeline.');
  const [organizationFormMessage, setOrganizationFormMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('Waiting for proof and document files.');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loadedProofs, setLoadedProofs] = useState<DocumentEntry[]>([]);
  const [selectedProof, setSelectedProof] = useState<DocumentEntry | null>(null);
  const [selectedProofId, setSelectedProofId] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [organizationPdfFileName, setOrganizationPdfFileName] = useState('No PDF selected');
  const [organizationPdfMessage, setOrganizationPdfMessage] = useState('Upload a PDF document for this registry.');
  const [publications, setPublications] = useState<Array<{ id: number; title: string; summary: string }>>([]);

  const stats = useMemo(() => [
    { label: 'Total Registries', value: '0' },
    { label: 'Documents Published', value: '0' },
    { label: 'Publications', value: '0' },
    { label: 'Verifications', value: '0' },
  ], []);

  const activeOrganization = organizationOptionsState.find((org) => org.id === selectedOrganization) ?? organizationOptionsState[0];
  const activeRegistries = activeOrganization.registries;

  function isPdfFile(file: File | undefined) {
    if (!file) return false;
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  function normalizeOrganizationId(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  }

  function handleCreateRegistry() {
    const orgName = organizationName.trim();
    const registry = registryName.trim();

    if (!orgName || !registry) {
      setOrganizationFormMessage('Please enter both an organization and a registry name.');
      return;
    }

    const organizationId = normalizeOrganizationId(orgName);
    const existingOrg = organizationOptionsState.find((org) => org.id === organizationId || org.name.toLowerCase() === orgName.toLowerCase());

    if (existingOrg) {
      if (existingOrg.registries.includes(registry)) {
        setOrganizationFormMessage(`The registry ${registry} already exists for ${existingOrg.name}.`);
        setSelectedOrganization(existingOrg.id);
        setSelectedRegistry(registry);
        return;
      }

      const updatedOrgs = organizationOptionsState.map((org) =>
        org.id === existingOrg.id
          ? { ...org, registries: [...org.registries, registry] }
          : org
      );

      setOrganizationOptionsState(updatedOrgs);
      setSelectedOrganization(existingOrg.id);
      setSelectedRegistry(registry);
      setOrganizationFormMessage(`Added ${registry} to ${existingOrg.name}.`);
      return;
    }

    const newOrg = {
      id: organizationId || `org-${Date.now()}`,
      name: orgName,
      registries: [registry],
    };

    setOrganizationOptionsState([...organizationOptionsState, newOrg]);
    setSelectedOrganization(newOrg.id);
    setSelectedRegistry(registry);
    setOrganizationFormMessage(`Created ${orgName} with registry ${registry}.`);
  }

  async function handleProofFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProofFileName(file.name);
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      if (parsed && typeof parsed === 'object' && 'inputs' in parsed) {
        const artifact = parsed as AllInputsArtifact;
        const entries = artifact.inputs;
        setLoadedProofs(entries);
        setSelectedProof(entries[0] ?? null);
        setSelectedProofId(entries[0]?.documentId?.toString() ?? '');
        setProofInfo(`Loaded ${artifact.documentCount} documents from ${artifact.registryName}.`);
      } else if (parsed && typeof parsed === 'object' && 'documentId' in parsed) {
        const single = parsed as SingleInputArtifact;
        const entry: DocumentEntry = {
          documentId: single.documentId,
          filename: single.filename,
          noirInput: {
            leaf: single.leaf,
            root: single.root,
            siblings: single.siblings,
            indices: single.indices,
            message: single.message,
            publicKey: single.publicKey,
            signature: single.signature,
          },
        };
        setLoadedProofs([entry]);
        setSelectedProof(entry);
        setSelectedProofId(entry.documentId.toString());
        setProofInfo(`Loaded a single proof for ${single.filename}.`);
      } else {
        setLoadedProofs([]);
        setSelectedProof(null);
        setSelectedProofId('');
        setProofInfo('This file is not a supported proof export.');
      }
    } catch {
      setProofInfo('The proof file could not be read as JSON.');
    }
  }

  async function handleOrganizationPdfFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isPdfFile(file)) {
      setOrganizationPdfFileName('No PDF selected');
      setOrganizationPdfMessage('Please choose a PDF file for the organization registry.');
      return;
    }

    setOrganizationPdfFileName(file.name);
    setOrganizationPdfMessage(`Ready to publish ${file.name} in the registry.`);
  }

  async function handleDocumentFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isPdfFile(file)) {
      setDocumentFileName('No PDF selected');
      setVerificationStatus('error');
      setVerificationMessage('Please upload a PDF document for verification.');
      return;
    }

    setDocumentFileName(file.name);
    const buffer = await file.arrayBuffer();
    const hash = await sha256Bytes(buffer);
    setDocumentHash(hash);
  }

  async function verifyDocument() {
    if (!selectedProof || !documentHash) {
      setVerificationStatus('error');
      setVerificationMessage('Please upload both a proof file and the external document.');
      return;
    }

    const poseidon = await buildPoseidon();
    const field = BigInt(`0x${documentHash}`);
    const leaf = poseidon([field]);
    const proofLeaf = BigInt(selectedProof.noirInput.leaf);
    const proofRoot = BigInt(selectedProof.noirInput.root);
    const siblings = selectedProof.noirInput.siblings.map((value) => BigInt(value));
    const indices = selectedProof.noirInput.indices;

    let current = poseidon.F.toObject(leaf) as bigint;
    if (current !== proofLeaf) {
      setVerificationStatus('error');
      setVerificationMessage('The uploaded document does not match the published record.');
      return;
    }

    for (let index = 0; index < siblings.length; index += 1) {
      if (indices[index]) {
        current = poseidon.F.toObject(poseidon([siblings[index], current])) as bigint;
      } else {
        current = poseidon.F.toObject(poseidon([current, siblings[index]])) as bigint;
      }
    }

    const messageValue = BigInt(selectedProof.noirInput.message);
    const publicKeyValue = BigInt(selectedProof.noirInput.publicKey);
    const r = BigInt(selectedProof.noirInput.signature[0] || '0');
    const s = BigInt(selectedProof.noirInput.signature[1] || '0');
    const challenge = poseidon.F.toObject(poseidon([proofRoot, r, publicKeyValue])) as bigint;
    const expectedR = mod(s * GENERATOR - challenge * publicKeyValue);
    const signatureValid = mod(r) === expectedR;

    if (current === proofRoot && signatureValid) {
      setVerificationStatus('success');
      setVerificationMessage(`Authentic document verified against ${registryName}.`);
    } else {
      setVerificationStatus('error');
      setVerificationMessage('The document could not be verified against the signed registry.');
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">Signed Merkle Registry</div>
          <p className="sidebar-copy">Secure document authenticity for organizations and verifiers.</p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <strong>Developer mode</strong>
          <label className="toggle-row">
            <input type="checkbox" checked={developerMode} onChange={() => setDeveloperMode((value) => !value)} />
            <span>Show cryptographic details</span>
          </label>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Trusted document publishing</p>
            <h1>Secure registry workspace</h1>
          </div>
          <div className="topbar-actions">
            <div className="pill">Publisher portal</div>
            <div className="pill">Public verification</div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <section className="card-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="card stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}

            <article className="card wide-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Live activity</p>
                  <h2>Registry health</h2>
                </div>
                <button className="ghost-btn">Export report</button>
              </div>
              <div className="bars">
                {['Certificates', 'Contracts', 'Invoices', 'Transcripts'].map((label, index) => (
                  <div key={label} className="bar-row">
                    <span>{label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${55 + index * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="card wide-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Recent activity</p>
                  <h2>Latest publications</h2>
                </div>
              </div>
              <ul className="list">
                <li><strong>Publication #3</strong><span>2 new certificates verified today</span></li>
                <li><strong>Publication #2</strong><span>Signed root published for the finance batch</span></li>
                <li><strong>Publication #1</strong><span>1 new employment contract added</span></li>
              </ul>
            </article>
          </section>
        )}

        {activeView === 'organizations' && (
          <section className="card-grid">
            <article className="card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Publisher portal</p>
                  <h2>Create a registry</h2>
                </div>
              </div>
              <label className="field">
                <span>Organization name</span>
                <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} />
              </label>
              <label className="field">
                <span>Registry name</span>
                <input value={registryName} onChange={(event) => setRegistryName(event.target.value)} />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>
              <label className="field">
                <span>Upload a PDF document</span>
                <input type="file" accept="application/pdf,.pdf" onChange={handleOrganizationPdfFile} />
              </label>
              <div className="helper-box">{organizationPdfFileName} • {organizationPdfMessage}</div>
<button className="primary-btn" onClick={handleCreateRegistry}>Create registry</button>
                {organizationFormMessage && <div className="helper-box">{organizationFormMessage}</div>}
            </article>

            <article className="card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Organization hierarchy</p>
                  <h2>{organizationName}</h2>
                </div>
              </div>
              <label className="field">
                <span>Issuing organization</span>
                <select value={selectedOrganization} onChange={(event) => {
                  const nextOrganization = event.target.value;
                  setSelectedOrganization(nextOrganization);
                  const nextRegistry = organizationOptionsState.find((org) => org.id === nextOrganization)?.registries[0] ?? '';
                  setSelectedRegistry(nextRegistry);
                }}>
                  {organizationOptionsState.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Registry</span>
                <select value={selectedRegistry} onChange={(event) => setSelectedRegistry(event.target.value)}>
                  {activeRegistries.map((registry) => (
                    <option key={registry} value={registry}>{registry}</option>
                  ))}
                </select>
              </label>
              <div className="profile-card">
                <strong>{registryName}</strong>
                <p>{description}</p>
                <div className="meta-row">
                  <span>Documents</span>
                  <strong>0</strong>
                </div>
                <div className="meta-row">
                  <span>Publications</span>
                  <strong>0</strong>
                </div>
              </div>
            </article>
          </section>
        )}

        {activeView === 'documents' && (
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Documents</p>
                <h2>Upload and manage official files</h2>
              </div>
              <button className="ghost-btn">Upload batch</button>
            </div>
            <div className="table">
              <div className="table-row header">
                <span>Name</span>
                <span>Status</span>
                <span>Published</span>
              </div>
              <div className="table-row">
                <span>No documents yet</span>
                <span className="badge">Waiting</span>
                <span>—</span>
              </div>
            </div>
          </section>
        )}

        {activeView === 'publications' && (
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Publications</p>
                <h2>Recent publishing events</h2>
              </div>
            </div>
            <ul className="list">
              <li><strong>Publication #3</strong><span>Signed and published 20 certificates</span></li>
              <li><strong>Publication #2</strong><span>Employment contracts published to the registry</span></li>
              <li><strong>Publication #1</strong><span>Invoice registry update completed</span></li>
            </ul>
          </section>
        )}

        {activeView === 'verification' && (
          <section className="card verification-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Public verification</p>
                <h2>Verify an external document</h2>
              </div>
            </div>

            <div className="verification-grid">
              <div className="stack">
                <label className="field">
                  <span>1. Choose issuing organization</span>
                  <select value={selectedOrganization} onChange={(event) => {
                    const nextOrganization = event.target.value;
                    setSelectedOrganization(nextOrganization);
                    const nextRegistry = organizationOptionsState.find((org) => org.id === nextOrganization)?.registries[0] ?? '';
                    setSelectedRegistry(nextRegistry);
                  }}>
                    {organizationOptionsState.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>2. Choose registry</span>
                  <select value={selectedRegistry} onChange={(event) => setSelectedRegistry(event.target.value)}>
                    {activeRegistries.map((registry) => (
                      <option key={registry} value={registry}>{registry}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>3. Upload registry proof JSON</span>
                  <input type="file" accept="application/json,.json" onChange={handleProofFile} />
                </label>
                <div className="helper-box">{proofInfo}</div>
                <label className="field">
                  <span>4. Choose document entry</span>
                  <select value={selectedProofId} onChange={(event) => {
                    const id = event.target.value;
                    const entry = loadedProofs.find((item) => item.documentId.toString() === id) ?? null;
                    setSelectedProof(entry);
                    setSelectedProofId(id);
                  }}>
                    <option value="">Select a proof entry</option>
                    {loadedProofs.map((entry) => (
                      <option key={entry.documentId} value={entry.documentId.toString()}>{entry.filename}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>5. Upload the external PDF document</span>
                  <input type="file" accept="application/pdf,.pdf" onChange={handleDocumentFile} />
                </label>
                <div className="helper-box">{documentFileName} • SHA-256 fingerprint ready</div>
                <button className="primary-btn" onClick={verifyDocument}>Verify document</button>
              </div>

              <div className="stack result-pane">
                <div className="result-card">
                  <p className="eyebrow">Verification result</p>
                  <h3>{verificationStatus === 'success' ? 'Authentic document' : verificationStatus === 'error' ? 'Verification failed' : 'Awaiting review'}</h3>
                  <p>{verificationMessage}</p>
                </div>

                {developerMode && (
                  <div className="helper-box">
                    <strong>Developer details</strong>
                    <p>SHA-256 fingerprint: {documentHash || 'Not available yet'}</p>
                    <p>Selected proof: {selectedProof?.filename ?? 'None'}</p>
                    <p>Registry: {registryName}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeView === 'settings' && (
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Settings</p>
                <h2>Registry and signing preferences</h2>
              </div>
            </div>
            <div className="stack">
              <div className="helper-box">Signing key status: Active</div>
              <div className="helper-box">Publication sync: Enabled</div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
