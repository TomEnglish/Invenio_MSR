// Material Readiness Dashboard
// Links PO → Shipping → Installation with work package readiness tracking

let workPackages = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Material Readiness Dashboard initializing...');
    await loadWorkPackages();
    renderAll();
});

// Load work package data
async function loadWorkPackages() {
    try {
        const response = await fetch('sample_data/sample_work_packages.json');
        const data = await response.json();
        workPackages = data.work_packages;

        // Calculate readiness for each package
        workPackages.forEach(pkg => {
            pkg.readiness = calculateReadiness(pkg);
        });

        console.log(`Loaded ${workPackages.length} work packages`);
    } catch (error) {
        console.error('Error loading work packages:', error);
    }
}

// Calculate material readiness score
function calculateReadiness(workPackage) {
    const materials = workPackage.required_materials;
    const total = materials.length;

    if (total === 0) {
        return {
            score: 1.0,
            onSite: 0,
            inTransit: 0,
            notReady: 0,
            status: 'ready',
            canStart: true,
            blockingItems: []
        };
    }

    const onSite = materials.filter(m => m.is_on_site).length;
    const inTransit = materials.filter(m => !m.is_on_site && (m.status === 'In Transit' || m.status === 'RTS')).length;
    const notReady = materials.filter(m => m.status === 'Not RTS' || (!m.is_on_site && m.status !== 'In Transit' && m.status !== 'RTS')).length;

    const score = onSite / total;
    const blockingItems = materials
        .filter(m => !m.is_on_site)
        .map(m => ({
            description: m.description,
            status: m.status,
            eta: m.eta
        }));

    let status;
    if (score === 1.0) {
        status = 'ready';
    } else if (score >= 0.5) {
        status = 'partial';
    } else {
        status = 'blocked';
    }

    return {
        score,
        onSite,
        inTransit,
        notReady,
        status,
        canStart: score === 1.0,
        blockingItems
    };
}

// Render all views
function renderAll() {
    renderWorkPackageCards();
    renderTimeline();
    renderExecutiveView();
}

// ============================================================================
// PRIMARY VIEW: Work Package Cards
// ============================================================================
function renderWorkPackageCards() {
    const container = document.getElementById('workPackagesContainer');

    container.innerHTML = workPackages.map(pkg => {
        const readiness = pkg.readiness;
        const materials = pkg.required_materials;

        // Status badge
        let statusBadge, statusIcon;
        if (readiness.status === 'ready') {
            statusBadge = '<span class="badge bg-success">✓ Ready to Start</span>';
            statusIcon = 'check-circle';
        } else if (readiness.status === 'partial') {
            statusBadge = '<span class="badge bg-warning">⚠ Partial Materials</span>';
            statusIcon = 'exclamation-triangle';
        } else {
            statusBadge = '<span class="badge bg-danger">✗ Blocked</span>';
            statusIcon = 'times-circle';
        }

        // Material breakdown
        const materialList = materials.map(m => {
            let icon, colorClass;
            if (m.is_on_site) {
                icon = 'check';
                colorClass = 'text-success';
            } else if (m.status === 'In Transit' || m.status === 'RTS') {
                icon = 'shipping-fast';
                colorClass = 'text-warning';
            } else {
                icon = 'times';
                colorClass = 'text-danger';
            }

            return `
                <div class="d-flex align-items-center mb-1">
                    <i class="fas fa-${icon} ${colorClass} me-2" style="width: 16px;"></i>
                    <small>${m.description}
                        ${m.is_on_site ? '<span class="badge bg-success-subtle text-success-emphasis">On Site</span>' :
                          `<span class="badge bg-warning-subtle text-warning-emphasis">${m.status}${m.eta ? ' - ETA: ' + new Date(m.eta).toLocaleDateString() : ''}</span>`}
                    </small>
                </div>
            `;
        }).join('');

        // Blocking items
        const blockingSection = readiness.blockingItems.length > 0 ? `
            <div class="mt-3 p-2 bg-light rounded">
                <strong class="text-danger"><i class="fas fa-exclamation-triangle me-1"></i> Missing Items:</strong>
                ${readiness.blockingItems.map(item => `
                    <div class="ms-3 mt-1">
                        <small>• ${item.description} ${item.eta ? `(ETA: ${new Date(item.eta).toLocaleDateString()})` : '(Not scheduled)'}</small>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="card work-package-card ${readiness.status} h-100">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="fas fa-${statusIcon} me-2"></i>
                            ${pkg.name}
                        </h6>
                        ${statusBadge}
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small class="text-muted">Material Readiness</small>
                                <small><strong>${Math.round(readiness.score * 100)}%</strong></small>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar ${readiness.status === 'ready' ? 'bg-success' : readiness.status === 'partial' ? 'bg-warning' : 'bg-danger'}"
                                     style="width: ${readiness.score * 100}%"></div>
                            </div>
                        </div>

                        <div class="row text-center mb-3">
                            <div class="col-4">
                                <div class="text-success"><strong>${readiness.onSite}</strong></div>
                                <small class="text-muted">On Site</small>
                            </div>
                            <div class="col-4">
                                <div class="text-warning"><strong>${readiness.inTransit}</strong></div>
                                <small class="text-muted">In Transit</small>
                            </div>
                            <div class="col-4">
                                <div class="text-danger"><strong>${readiness.notReady}</strong></div>
                                <small class="text-muted">Missing</small>
                            </div>
                        </div>

                        <div class="mb-2">
                            <small class="text-muted"><i class="fas fa-calendar me-1"></i> ${new Date(pkg.scheduled_start).toLocaleDateString()} - ${new Date(pkg.scheduled_finish).toLocaleDateString()}</small>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted"><i class="fas fa-hard-hat me-1"></i> ${pkg.discipline}</small>
                            ${pkg.is_critical ? '<span class="badge bg-danger-subtle text-danger-emphasis ms-2">Critical Path</span>' : ''}
                        </div>

                        <hr>

                        <div class="materials-list" style="max-height: 200px; overflow-y: auto;">
                            <strong class="d-block mb-2"><small>Required Materials (${materials.length}):</small></strong>
                            ${materialList}
                        </div>

                        ${blockingSection}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// SECONDARY VIEW: Material Readiness Timeline
// ============================================================================
function renderTimeline() {
    const container = document.getElementById('timelineContainer');

    container.innerHTML = workPackages.map(pkg => {
        const readiness = pkg.readiness;
        const materials = pkg.required_materials;

        // Material status indicators
        const materialIndicators = materials.map(m => {
            let bgColor, icon;
            if (m.is_on_site) {
                bgColor = '#8dc63f';
                icon = '✓';
            } else if (m.status === 'In Transit' || m.status === 'RTS') {
                bgColor = '#f5a623';
                icon = '⚠';
            } else {
                bgColor = '#d0021b';
                icon = '✗';
            }

            return `<span class="material-indicator" style="background-color: ${bgColor};" title="${m.description} - ${m.status}">${icon}</span>`;
        }).join('');

        // Timeline bar color
        let barColor;
        if (readiness.status === 'ready') barColor = '#8dc63f';
        else if (readiness.status === 'partial') barColor = '#f5a623';
        else barColor = '#d0021b';

        return `
            <div class="timeline-row">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <strong>${pkg.name}</strong>
                        <div class="text-muted small">${pkg.discipline}${pkg.is_critical ? ' • Critical' : ''}</div>
                        <div class="text-muted small">${new Date(pkg.scheduled_start).toLocaleDateString()} - ${new Date(pkg.scheduled_finish).toLocaleDateString()}</div>
                    </div>
                    <div class="col-md-5">
                        <div class="timeline-bar">
                            <div class="timeline-progress" style="width: ${pkg.progress_percent}%; background-color: ${barColor};">
                                ${pkg.progress_percent}%
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                ${materialIndicators}
                            </div>
                            <div class="text-end">
                                <strong>${Math.round(readiness.score * 100)}%</strong>
                                <div class="small text-muted">Material Ready</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// EXECUTIVE VIEW: Traffic Light Dashboard
// ============================================================================
function renderExecutiveView() {
    const ready = workPackages.filter(p => p.readiness.status === 'ready');
    const partial = workPackages.filter(p => p.readiness.status === 'partial');
    const blocked = workPackages.filter(p => p.readiness.status === 'blocked');

    // Update summary counts
    document.getElementById('execReadyCount').textContent = ready.length;
    document.getElementById('execPartialCount').textContent = partial.length;
    document.getElementById('execBlockedCount').textContent = blocked.length;

    // Render traffic light cards
    const container = document.getElementById('executiveContainer');

    container.innerHTML = workPackages.map(pkg => {
        const readiness = pkg.readiness;
        let lightClass, lightIcon, statusText, statusColor;

        if (readiness.status === 'ready') {
            lightClass = 'green';
            lightIcon = 'check';
            statusText = 'Ready - All materials on site';
            statusColor = 'success';
        } else if (readiness.status === 'partial') {
            lightClass = 'yellow';
            lightIcon = 'exclamation-triangle';
            statusText = `Partial - ${readiness.onSite}/${pkg.required_materials.length} materials on site`;
            statusColor = 'warning';
        } else {
            lightClass = 'red';
            lightIcon = 'times-circle';
            statusText = `Blocked - ${readiness.notReady} materials missing`;
            statusColor = 'danger';
        }

        return `
            <div class="traffic-light-card bg-white border">
                <div class="traffic-light ${lightClass}">
                    <i class="fas fa-${lightIcon}"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${pkg.name}</h6>
                    <p class="mb-1 text-${statusColor}">${statusText}</p>
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i> Start: ${new Date(pkg.scheduled_start).toLocaleDateString()}
                        ${pkg.is_critical ? ' • <span class="badge bg-danger-subtle text-danger-emphasis">Critical Path</span>' : ''}
                    </small>
                </div>
                <div class="text-end">
                    <div class="display-6">${Math.round(readiness.score * 100)}%</div>
                    <small class="text-muted">Ready</small>
                </div>
            </div>
        `;
    }).join('');
}

console.log('Material Readiness Dashboard loaded');
