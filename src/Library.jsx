import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://raw.githubusercontent.com/ToxSam/open-source-3d-assets/main/data/';

export default function Library() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [assets, setAssets] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // 1. Fetch the master list of all collections (projects) on mount
  useEffect(() => {
    fetch(`${BASE_URL}projects.json`)
      .then(r => r.json())
      .then(data => {
        setProjects(data);
        setLoadingProjects(false);
        // Auto-select the first project if available
        if (data.length > 0) {
          handleSelectProject(data[0]);
        }
      })
      .catch(e => {
        console.error('Error fetching projects:', e);
        setLoadingProjects(false);
      });
  }, []);

  // 2. Fetch assets for a specific project when clicked
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setLoadingAssets(true);
    setAssets([]); // Clear current assets while loading

    fetch(`${BASE_URL}${project.asset_data_file}`)
      .then(r => r.json())
      .then(data => {
        setAssets(data);
        setLoadingAssets(false);
      })
      .catch(e => {
        console.error('Error fetching assets:', e);
        setLoadingAssets(false);
      });
  };

  return (
    <div className="page-container library-page">
      <div className="library-container">
        <h2>CC0 Multiverse Archives</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          Select a dimension (collection) to explore its entities.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: '2rem', opacity: 0.8 }}>
          Data and models are proudly sourced from <a href="https://www.opensource3dassets.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>Open Source 3D Assets</a> (GitHub: <a href="https://github.com/ToxSam/open-source-3d-assets" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>ToxSam</a>). We deeply appreciate the original creator for compiling and allowing the use of this comprehensive CC0 3D model database.
        </p>

        {loadingProjects ? (
          <p>Connecting to the archive matrix...</p>
        ) : (
          <div className="library-content">
            {/* Tabs / Sidebar for Projects */}
            <div className="project-tabs">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  className={`tab-btn ${selectedProject?.id === proj.id ? 'active' : ''}`}
                  onClick={() => handleSelectProject(proj)}
                >
                  <span className="tab-name">{proj.name}</span>
                  <span className="tab-creator">by {proj.creator_id}</span>
                </button>
              ))}
            </div>

            {/* Grid for the selected project's assets */}
            <div className="assets-view">
              {selectedProject && (
                <div className="project-info">
                  <h3>{selectedProject.name}</h3>
                  <p>{selectedProject.description}</p>
                </div>
              )}

              {loadingAssets ? (
                <div className="loader">Materializing models...</div>
              ) : (
                <div className="library-grid">
                  {assets.length === 0 ? (
                    <p>No entities found in this dimension.</p>
                  ) : (
                    assets.map((asset) => (
                      <div className="asset-card" key={asset.id}>
                        <img 
                          src={asset.thumbnail_url} 
                          alt={asset.name} 
                          className="asset-image" 
                          loading="lazy" 
                        />
                        <h4 className="asset-title">{asset.name}</h4>
                        <a href={asset.model_file_url} download className="btn">
                          Download GLB
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
