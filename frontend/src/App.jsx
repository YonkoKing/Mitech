import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("lot");

  const [form, setForm] = useState({
    ref: "",
    lot: "",
    netMes: "",
    quantity: "",
    patch: "",
    materialType: "SMALL_MATERIAL",
    classification: "STANDARD"
  });

  const loadProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const loadStats = () => {
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  };

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        netMes: Number(form.netMes),
        quantity: Number(form.quantity)
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error);
          return;
        }
        loadProducts();
        loadStats();

        setForm({
          ref: "",
          lot: "",
          netMes: "",
          quantity: "",
          patch: "",
          materialType: "SMALL_MATERIAL",
          classification: "STANDARD"
        });
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" })
      .then(() => {
        loadProducts();
        loadStats();
      });
  };

  const formatZoneType = (type) => {
    if (type === 'SMALL_MATERIAL') return 'Petit Matériel';
    if (type === 'ROLL') return 'Rouleaux';
    if (type === 'LEATHER_HORSE') return 'Chevalets de Cuir';
    return type;
  };

  const formatClassification = (cls) => {
    if (cls === 'HIGH_RUNNER') return 'Forte Rotation';
    if (cls === 'STANDARD') return 'Standard';
    if (cls === 'CRITICAL') return 'Critique';
    return cls;
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const value = String(p[searchBy] || "").toLowerCase();
    return value.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header">
        <span style={{ fontSize: '2.5rem' }}>📦</span>
        <h1 className="dashboard-title">Vue d'ensemble de l'inventaire</h1>
      </header>

      {/* STATS GRID */}
      {stats && (
        <div className="stats-grid">
          <Card title="Total des Produits" value={stats.totalProducts} />
          <Card title="Sous le Pt. de Cde. (Alerte)" value={stats.belowRop} highlight={stats.belowRop > 0} />
          
          {stats.capacities?.map(cap => (
            <Card 
              key={cap.zoneType} 
              title={`Capacité ${formatZoneType(cap.zoneType)}`} 
              value={`${cap.totalOccupancy} / ${cap.totalCapacity}`} 
            />
          ))}
        </div>
      )}

      {/* FORM */}
      <form className="form-container" onSubmit={handleSubmit}>
        <h3 className="form-title">
          <span>➕</span> Réception de nouveau matériel
        </h3>

        <div className="form-grid">
          <input className="input-field" name="ref" placeholder="Ref de Materiel" value={form.ref} onChange={handleChange} required />
          <input className="input-field" name="lot" placeholder="LOT" value={form.lot} onChange={handleChange} required />
          <input className="input-field" name="netMes" type="number" step="0.01" placeholder="Net Mes" value={form.netMes} onChange={handleChange} required />
          <input className="input-field" name="quantity" type="number" placeholder="Vol (Quantite)" value={form.quantity} onChange={handleChange} required />
          <input className="input-field" name="patch" placeholder="Patch specifique" value={form.patch} onChange={handleChange} required />
          
          <select className="input-field" name="materialType" value={form.materialType} onChange={handleChange}>
            <option value="SMALL_MATERIAL">Petit Matériel</option>
            <option value="ROLL">Rouleaux</option>
            <option value="LEATHER_HORSE">Chevalets de Cuir</option>
          </select>
          
          <select className="input-field" name="classification" value={form.classification} onChange={handleChange}>
            <option value="HIGH_RUNNER">Forte Rotation (Rapide)</option>
            <option value="STANDARD">Standard (Moyen/Lent)</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>

        <button className="btn-primary" type="submit">
          <span>Stocker</span>
        </button>
      </form>


      {/* PRODUCTS LIST */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <span>📋</span> Inventaire Actuel
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', flex: '1', minWidth: '300px', maxWidth: '500px', marginLeft: 'auto' }}>
          <select 
            className="input-field" 
            style={{ width: '130px', margin: 0 }} 
            value={searchBy} 
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option value="lot">Par LOT</option>
            <option value="ref">Par Réf</option>
            <option value="quantity">Par Qté</option>
            <option value="emplacementCode">Par Empl.</option>
          </select>
          <input 
            type="text" 
            className="input-field" 
            placeholder={`Rechercher...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aucun matériel trouvé</h3>
          <p>Réceptionnez votre premier matériel ci-dessus pour déclencher l'attribution automatique.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(p => {
            const isBelowRop = p.quantity <= p.rop;
            return (
              <div key={p.id} className="product-card" style={{ borderColor: isBelowRop ? 'var(--danger-color)' : '' }}>
                <div className="product-header">
                  <div>
                    <h3 className="product-name">{p.ref}</h3>
                    <span className="product-sku">LOT: {p.lot} | {formatZoneType(p.materialType)}</span>
                  </div>
                  <button onClick={() => handleDelete(p.id)} style={{background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.2rem'}}>×</button>
                </div>
                
                <div className="product-details">
                  <div className="detail-row">
                    <span>Emplacement</span>
                    <span className="detail-value" style={{color: 'var(--accent-color)'}}>{p.emplacementCode} ({p.subZone.replace('_', ' ')})</span>
                  </div>
                  <div className="detail-row">
                    <span>Niveau de Stock</span>
                    <span className="detail-value" style={{color: isBelowRop ? 'var(--danger-color)' : 'var(--success-color)'}}>
                      {p.quantity} (Pt. Cde: {p.rop})
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Classe</span>
                    <span className="detail-value">{formatClassification(p.classification)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div className="stat-card" style={{ borderColor: highlight ? 'var(--danger-color)' : '' }}>
      <h4 className="stat-title">{title}</h4>
      <div className="stat-value" style={{ color: highlight ? 'var(--danger-color)' : '' }}>{value}</div>
    </div>
  );
}

export default App;
