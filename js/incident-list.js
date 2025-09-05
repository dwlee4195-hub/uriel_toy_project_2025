// incident-list.html 페이지 스크립트

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadIncidents();
    updateStatistics();
    
    // 5초마다 데이터 새로고침
    setInterval(() => {
        loadIncidents();
        updateStatistics();
    }, 5000);
    
    // storage 이벤트 리스너 (다른 탭에서 데이터 변경 감지)
    window.addEventListener('storage', function(e) {
        if (e.key === 'incidents' || e.key === 'teams') {
            loadIncidents();
            updateStatistics();
        }
    });
});

// 방치물품 목록 로드 (필터링 적용)
function loadIncidents(filteredIncidents = null) {
    const incidents = filteredIncidents || window.dataManager.getIncidents();
    const teams = window.dataManager.getTeams();
    const tbody = document.getElementById('incident-tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    incidents.forEach(incident => {
        const row = createIncidentRow(incident, teams);
        tbody.appendChild(row);
    });
    
    // 데이터가 없을 경우
    if (incidents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-400">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>조건에 맞는 방치물품이 없습니다.</p>
                </td>
            </tr>
        `;
    }
}

// 필터 적용 함수
function applyFilters() {
    const allIncidents = window.dataManager.getIncidents();
    const periodFilter = document.getElementById('period-filter')?.value || 'week';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    const locationSearch = document.getElementById('location-search')?.value || '';
    const includeFalsePositive = document.getElementById('include-false-positive')?.checked || false;
    
    let filteredIncidents = [...allIncidents];
    
    // 오탐지 포함/제외 필터 (먼저 적용)
    if (!includeFalsePositive) {
        // 오탐지 제외: resolution.type이 'false'가 아닌 것만
        filteredIncidents = filteredIncidents.filter(incident => {
            if (incident.status === 'resolved' && incident.resolution) {
                return incident.resolution.type !== 'false';
            }
            return true; // resolved가 아니면 포함
        });
    }
    
    // 기간 필터
    const now = new Date();
    if (periodFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredIncidents = filteredIncidents.filter(incident => {
            const incidentDate = new Date(incident.detectedAt);
            return incidentDate >= today;
        });
    } else if (periodFilter === 'week') {
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        filteredIncidents = filteredIncidents.filter(incident => {
            const incidentDate = new Date(incident.detectedAt);
            return incidentDate >= weekAgo;
        });
    } else if (periodFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredIncidents = filteredIncidents.filter(incident => {
            const incidentDate = new Date(incident.detectedAt);
            return incidentDate >= monthAgo;
        });
    }
    
    // 상태 필터 (간소화된 3개 상태)
    if (statusFilter !== 'all') {
        if (statusFilter === 'pending') {
            filteredIncidents = filteredIncidents.filter(incident => incident.status === 'pending');
        } else if (statusFilter === 'in_progress') {
            // 출동 중: assigned 또는 in_progress 상태
            filteredIncidents = filteredIncidents.filter(incident => 
                incident.status === 'assigned' || incident.status === 'in_progress');
        } else if (statusFilter === 'resolved') {
            filteredIncidents = filteredIncidents.filter(incident => incident.status === 'resolved');
        }
    }
    
    // 위치 검색
    if (locationSearch.trim()) {
        const searchTerm = locationSearch.toLowerCase().trim();
        filteredIncidents = filteredIncidents.filter(incident => 
            incident.location.toLowerCase().includes(searchTerm) ||
            incident.zone?.toLowerCase().includes(searchTerm)
        );
    }
    
    // 필터링된 결과로 테이블 업데이트
    loadIncidents(filteredIncidents);
    
    // 통계도 필터링된 데이터로 업데이트
    updateStatistics(filteredIncidents);
}

// 방치물품 행 생성
function createIncidentRow(incident, teams) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-700/50';
    
    // 경과 시간 계산
    let elapsedTimeText = '';
    
    if (incident.status === 'resolved' && incident.resolution && incident.resolution.timestamp) {
        // 처리 완료된 경우: 감지시간부터 해결시간까지
        const detectedTime = new Date(incident.detectedAt);
        const resolvedTime = new Date(incident.resolution.timestamp);
        const elapsedMs = resolvedTime - detectedTime;
        const elapsedHours = Math.floor(elapsedMs / 3600000);
        const elapsedMinutes = Math.floor((elapsedMs % 3600000) / 60000);
        
        if (elapsedHours > 0) {
            elapsedTimeText = `${elapsedHours}시간 ${elapsedMinutes}분`;
        } else {
            elapsedTimeText = `${elapsedMinutes}분`;
        }
    } else {
        // 처리중인 경우: 감지시간부터 현재까지
        const detectedTime = new Date(incident.detectedAt);
        const now = new Date();
        const elapsedMs = now - detectedTime;
        const elapsedHours = Math.floor(elapsedMs / 3600000);
        const elapsedMinutes = Math.floor((elapsedMs % 3600000) / 60000);
        
        if (elapsedHours > 0) {
            elapsedTimeText = `${elapsedHours}시간 ${elapsedMinutes}분`;
        } else {
            elapsedTimeText = `${elapsedMinutes}분`;
        }
    }
    
    // 상태별 스타일 (다크테마 최적화)
    const statusStyles = {
        pending: { 
            color: 'red-400', 
            text: '신규경고', 
            icon: 'bg-red-500/20 animate-pulse', 
            badge: 'bg-red-500/10 text-red-400 border border-red-500/30' 
        },
        assigned: { 
            color: 'amber-400', 
            text: '출동중', 
            icon: 'bg-amber-500/20', 
            badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
        },
        in_progress: { 
            color: 'yellow-400', 
            text: '처리중', 
            icon: 'bg-yellow-500/20', 
            badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' 
        },
        resolved: { 
            color: 'blue-400', 
            text: '처리완료', 
            icon: 'bg-blue-500/20', 
            badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
        }
    };
    
    const status = statusStyles[incident.status] || statusStyles.pending;
    
    // 위험도별 스타일 (다크테마 최적화)
    const riskColors = {
        high: 'text-red-400 bg-red-500/10 border border-red-500/30',
        medium: 'text-amber-400 bg-amber-500/10 border border-amber-500/30',
        low: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
    };
    
    // 팀 이름 가져오기
    const assignedTeam = teams.find(t => t.id === incident.assignedTeam);
    const teamName = assignedTeam ? assignedTeam.name : '-';
    
    tr.innerHTML = `
        <td class="px-6 py-4">
            <a href="incident-detail.html?id=${incident.id}" class="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-all duration-200 inline-flex items-center gap-1 group">
                <i class="fas fa-link text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                ${incident.id}
            </a>
        </td>
        <td class="px-6 py-4">
            <span class="inline-flex items-center gap-2 ${status.badge} px-3 py-1 rounded-full">
                <span class="relative flex h-2 w-2">
                    <span class="relative inline-flex rounded-full h-2 w-2 ${status.icon}"></span>
                </span>
                <span class="text-xs font-bold uppercase tracking-wide">${status.text}</span>
            </span>
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2">
                <i class="fas fa-map-marker-alt text-gray-500 text-xs"></i>
                <span class="text-gray-300 font-medium">${incident.location}</span>
            </div>
        </td>
        <td class="px-6 py-4">
            <span class="text-gray-400 bg-gray-800/50 px-2 py-1 rounded-md text-sm">${incident.objectType}</span>
        </td>
        <td class="px-6 py-4">
            <span class="${riskColors[incident.riskLevel]} px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                <i class="fas ${incident.riskLevel === 'high' ? 'fa-exclamation-triangle' : incident.riskLevel === 'medium' ? 'fa-exclamation-circle' : 'fa-check-circle'} text-xs"></i>
                ${incident.riskLevel === 'high' ? '높음' : incident.riskLevel === 'medium' ? '중간' : '낮음'}
            </span>
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2 text-gray-400">
                <i class="far fa-clock text-xs"></i>
                <span class="text-sm">${formatTime(incident.detectedAt)}</span>
            </div>
        </td>
        <td class="px-6 py-4">
            ${incident.status === 'resolved' ? 
                `<span class="text-gray-400">${elapsedTimeText}</span>` : 
                `<span class="text-orange-400 font-medium">${elapsedTimeText}</span>`
            }
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2">
                ${incident.status === 'pending' ? 
                    `<select class="team-select bg-gray-800/70 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/70 hover:border-gray-500 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                        onchange="assignTeam('${incident.id}', this.value)">
                        <option value="" class="bg-gray-800">팀 선택</option>
                        ${teams.map(team => 
                            `<option value="${team.id}" class="bg-gray-800" ${team.status === 'busy' ? 'disabled' : ''}>
                                ${team.name} ${team.status === 'busy' ? '(출동중)' : ''}
                            </option>`
                        ).join('')}
                    </select>
                    <button onclick="markAsFalsePositive('${incident.id}', null)" 
                        class="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 text-xs rounded-lg font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-500 shadow-sm hover:shadow-md flex items-center gap-1.5">
                        <i class="fas fa-ban text-xs"></i>
                        오탐지
                    </button>` :
                    incident.status === 'assigned' || incident.status === 'in_progress' ?
                        `<span class="font-medium">${teamName}</span>
                        <button onclick="cancelAssignment('${incident.id}', '${incident.assignedTeam}')" 
                            class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs rounded-lg font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50 shadow-sm hover:shadow-red-500/20 flex items-center gap-1.5 transform hover:scale-105">
                            <i class="fas fa-undo text-xs"></i>
                            배정취소
                        </button>
                        <button onclick="markAsFalsePositive('${incident.id}', '${incident.assignedTeam}')" 
                            class="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 text-xs rounded-lg font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-500 shadow-sm hover:shadow-md flex items-center gap-1.5">
                            <i class="fas fa-ban text-xs"></i>
                            오탐지
                        </button>` :
                    incident.status === 'resolved' && incident.resolution && incident.resolution.description.includes('오탐') ?
                        `<span class="text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full text-xs font-medium">오탐지</span>` :
                        `<span class="text-gray-400 font-medium">${teamName}</span>`
                }
            </div>
        </td>
    `;
    
    return tr;
}

// 시간 포맷
function formatTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 감식팀 배정
function assignTeam(incidentId, teamId) {
    if (!teamId) return;
    
    const result = window.dataManager.assignTeam(incidentId, teamId);
    
    if (result.success) {
        // 성공 알림
        showNotification('success', '감식팀이 배정되었습니다.');
        
        // 데이터 새로고침
        loadIncidents();
        updateStatistics();
    } else {
        // 실패 알림
        showNotification('error', result.message);
    }
}

// 배정 취소
function cancelAssignment(incidentId, teamId) {
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    const incidentIndex = incidents.findIndex(i => i.id === incidentId);
    if (incidentIndex !== -1) {
        incidents[incidentIndex].status = 'pending';
        incidents[incidentIndex].assignedTeam = null;
        incidents[incidentIndex].assignedAt = null;
        localStorage.setItem('incidents', JSON.stringify(incidents));
    }
    
    const teamIndex = teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
        teams[teamIndex].status = 'available';
        teams[teamIndex].currentAssignment = null;
        localStorage.setItem('teams', JSON.stringify(teams));
    }
    
    showNotification('info', '팀 배정이 취소되었습니다.');
    loadIncidents();
    updateStatistics();
}

// 오탐지 처리
function markAsFalsePositive(incidentId, teamId) {
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    const incidentIndex = incidents.findIndex(i => i.id === incidentId);
    if (incidentIndex !== -1) {
        incidents[incidentIndex].status = 'resolved';
        incidents[incidentIndex].resolution = {
            description: '오탐지로 확인됨',
            resolvedAt: new Date().toISOString()
        };
        localStorage.setItem('incidents', JSON.stringify(incidents));
    }
    
    // 팀 상태 해제
    if (teamId) {
        const teamIndex = teams.findIndex(t => t.id === teamId);
        if (teamIndex !== -1) {
            teams[teamIndex].status = 'available';
            teams[teamIndex].currentAssignment = null;
            teams[teamIndex].totalResolved = (teams[teamIndex].totalResolved || 0) + 1;
            localStorage.setItem('teams', JSON.stringify(teams));
        }
    }
    
    showNotification('success', '오탐지로 처리되었습니다.');
    loadIncidents();
    updateStatistics();
}

// 통계 업데이트 (필터링된 데이터 지원)
function updateStatistics(filteredIncidents = null) {
    const incidents = filteredIncidents || JSON.parse(localStorage.getItem('incidents') || '[]');
    
    // 필터링된 데이터로 통계 계산
    const stats = {
        total: incidents.length,
        pending: incidents.filter(i => i.status === 'pending').length,
        assigned: incidents.filter(i => i.status === 'assigned' || i.status === 'in_progress').length,
        resolved: incidents.filter(i => i.status === 'resolved').length
    };
    
    // 오탐지 계산 (resolved 중에서 resolution.type이 'false'이거나 description에 '오탐' 포함된 경우)
    const falsePositives = incidents.filter(i => 
        i.status === 'resolved' && 
        i.resolution && 
        (i.resolution.type === 'false' || (i.resolution.description || '').includes('오탐'))
    ).length;
    
    // 전체
    const totalElement = document.getElementById('stat-total');
    if (totalElement) {
        totalElement.textContent = stats.total;
    }
    
    // 신규 경고
    const newAlertElement = document.getElementById('stat-new-alerts');
    if (newAlertElement) {
        newAlertElement.textContent = stats.pending;
    }
    
    // 출동 중
    const inProgressElement = document.getElementById('stat-in-progress');
    if (inProgressElement) {
        inProgressElement.textContent = stats.assigned;
    }
    
    // 처리 완료
    const completedElement = document.getElementById('stat-completed');
    if (completedElement) {
        completedElement.textContent = stats.resolved;
    }
    
    // 오탐지
    const falsePositiveElement = document.getElementById('stat-false-positive');
    if (falsePositiveElement) {
        falsePositiveElement.textContent = falsePositives;
    }
    
    // 진행률 바 업데이트 (오탐지 포함)
    const extendedStats = { ...stats, falsePositive: falsePositives };
    updateProgressBars(extendedStats);
    
    // 페이지네이션 전체 건수 업데이트
    const paginationTotal = document.getElementById('pagination-total');
    if (paginationTotal) {
        paginationTotal.textContent = stats.total;
    }
}

// 진행률 바 업데이트
function updateProgressBars(stats) {
    const total = stats.total || 1; // 0으로 나누기 방지
    
    // 신규 경고 진행률
    const newAlertBar = document.querySelector('.bg-red-900.h-1\\.5');
    if (newAlertBar) {
        const percentage = (stats.pending / total * 100).toFixed(1);
        newAlertBar.style.width = percentage + '%';
    }
    
    // 출동 중 진행률
    const inProgressBar = document.querySelector('.bg-orange-900.h-1\\.5');
    if (inProgressBar) {
        const percentage = (stats.assigned / total * 100).toFixed(1);
        inProgressBar.style.width = percentage + '%';
    }
    
    // 처리 완료 진행률
    const completedBar = document.querySelector('.bg-blue-900.h-1\\.5');
    if (completedBar) {
        const percentage = (stats.resolved / total * 100).toFixed(1);
        completedBar.style.width = percentage + '%';
    }
    
    // 오탐지 진행률
    const falsePositiveBar = document.querySelector('.bg-gray-900.h-1\\.5');
    if (falsePositiveBar) {
        const percentage = ((stats.falsePositive || 0) / total * 100).toFixed(1);
        falsePositiveBar.style.width = percentage + '%';
    }
}

// 전역 함수로 등록 (HTML onclick에서 호출)
window.assignTeam = assignTeam;
window.cancelAssignment = cancelAssignment;
window.markAsFalsePositive = markAsFalsePositive;

// 알림 표시
function showNotification(type, message) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    
    const colors = {
        success: 'bg-green-900/90 border-green-500/50 text-green-200',
        error: 'bg-red-900/90 border-red-500/50 text-red-200',
        info: 'bg-blue-900/90 border-blue-500/50 text-blue-200'
    };
    
    const icons = {
        success: 'fa-check-circle text-green-400',
        error: 'fa-exclamation-circle text-red-400',
        info: 'fa-info-circle text-blue-400'
    };
    
    notification.innerHTML = `
        <div class="${colors[type]} border-2 px-5 py-4 rounded-xl shadow-2xl flex items-center space-x-3 backdrop-blur-sm">
            <i class="fas ${icons[type]} text-lg"></i>
            <p class="font-medium">${message}</p>
        </div>
    `;
    
    container.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 알림 닫기
function closeNotification() {
    const notification = document.getElementById('alert-notification');
    if (notification) {
        notification.style.display = 'none';
    }
}