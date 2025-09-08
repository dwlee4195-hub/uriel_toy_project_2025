// 감식팀 관리 페이지 스크립트

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadTeams();
    updateStatistics();
    loadAvailableUsers();
});

// 팀 목록 로드
function loadTeams() {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const container = document.getElementById('teams-container');
    
    container.innerHTML = '';
    
    if (teams.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-400">
                <i class="fas fa-users text-4xl mb-2"></i>
                <p>등록된 팀이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    teams.forEach(team => {
        const card = createTeamCard(team, users);
        container.appendChild(card);
    });
}

// 팀 카드 생성
function createTeamCard(team, users) {
    const card = document.createElement('div');
    card.className = 'bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800/70 transition-all duration-200';
    
    // 팀 상태별 색상 (다크테마 최적화)
    const statusColors = {
        available: { bg: 'bg-emerald-500/10 border border-emerald-500/30', text: 'text-emerald-400', label: '대기중' },
        busy: { bg: 'bg-amber-500/10 border border-amber-500/30', text: 'text-amber-400', label: '출동중' },
        'off-duty': { bg: 'bg-gray-700/50 border border-gray-600/50', text: 'text-gray-400', label: '비번' }
    };
    
    const status = statusColors[team.status] || statusColors.available;
    
    // 팀장 정보
    const leader = users.find(u => u.id === team.leader);
    const leaderName = leader ? leader.name : '미지정';
    
    // 팀원 목록
    const memberNames = team.members.map(memberId => {
        const member = users.find(u => u.id === memberId);
        return member ? member.name : '알 수 없음';
    });
    
    card.innerHTML = `
        <div class="p-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-100">${team.name}</h3>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${status.bg} ${status.text} mt-2">
                        <span class="relative flex h-2 w-2">
                            <span class="relative inline-flex rounded-full h-2 w-2 ${team.status === 'busy' ? 'animate-pulse' : ''} ${team.status === 'available' ? 'bg-emerald-400' : team.status === 'busy' ? 'bg-amber-400' : 'bg-gray-500'}"></span>
                        </span>
                        ${status.label}
                    </span>
                </div>
                <div class="flex gap-1">
                    <button onclick="editTeam('${team.id}')" class="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group" title="팀명 수정">
                        <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button onclick="deleteTeam('${team.id}')" class="p-2 hover:bg-red-500/10 rounded-lg transition-all duration-200 group" title="팀 삭제">
                        <svg class="w-4 h-4 text-red-500 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="space-y-3">
                <div>
                    <p class="text-sm text-gray-400 mb-1">팀장</p>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                            <span class="text-xs font-bold text-amber-400">
                                ${leaderName.charAt(0)}
                            </span>
                        </div>
                        <p class="font-medium text-gray-200">
                            <i class="fas fa-crown text-amber-400 text-xs mr-1"></i>
                            ${leaderName}
                        </p>
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-gray-400">팀원 (${team.members.length}명)</p>
                    <div class="mt-1">
                        ${memberNames.length > 0 ? 
                            memberNames.map(name => `
                                <span class="inline-flex items-center gap-1 bg-gray-700/50 border border-gray-600/50 text-gray-300 px-2.5 py-1 rounded-lg text-xs mr-1 mb-1">
                                    <i class="fas fa-user text-gray-500 text-xs"></i>
                                    ${name}
                                </span>
                            `).join('') : 
                            '<span class="text-sm text-gray-500 italic">팀원 없음</span>'
                        }
                    </div>
                </div>
                
                <div class="pt-3 border-t border-gray-700">
                    <div class="flex justify-between items-center">
                        ${team.currentAssignment ? 
                            `<span class="inline-flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-full">
                                <i class="fas fa-exclamation-triangle text-xs"></i>
                                ${team.currentAssignment} 처리 중
                            </span>` :
                            '<span></span>'
                        }
                        <button onclick="openManageMembersModal('${team.id}')" class="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5">
                            <i class="fas fa-users-cog text-xs"></i>
                            팀원 관리
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// 통계 업데이트
function updateStatistics() {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    const stats = {
        total: teams.length,
        available: teams.filter(t => t.status === 'available').length,
        busy: teams.filter(t => t.status === 'busy').length
    };
    
    document.getElementById('total-teams').textContent = stats.total;
    document.getElementById('available-teams').textContent = stats.available;
    document.getElementById('busy-teams').textContent = stats.busy;
}

// 사용 가능한 사용자 로드 (팀장/팀원용)
function loadAvailableUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    // 이미 팀에 속한 사용자 ID 목록
    const assignedUserIds = new Set();
    teams.forEach(team => {
        team.members.forEach(memberId => assignedUserIds.add(memberId));
    });
    
    // 팀장 선택 드롭다운
    const leaderSelect = document.querySelector('select[name="teamLeader"]');
    if (leaderSelect) {
        leaderSelect.innerHTML = '<option value="">선택하세요</option>';
        
        users.filter(u => 
            (u.role === 'inspector' || u.role === 'team_leader' || u.role === 'team_member') && 
            !assignedUserIds.has(u.id)
        ).forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.username})`;
            leaderSelect.appendChild(option);
        });
    }
    
    // 팀원 체크박스
    const memberCheckboxes = document.getElementById('memberCheckboxes');
    if (memberCheckboxes) {
        memberCheckboxes.innerHTML = '';
        
        const availableUsers = users.filter(u => 
            (u.role === 'inspector' || u.role === 'team_leader' || u.role === 'team_member') && 
            !assignedUserIds.has(u.id)
        );
        
        if (availableUsers.length === 0) {
            memberCheckboxes.innerHTML = '<p class="text-sm text-gray-400">배정 가능한 팀원이 없습니다.</p>';
        } else {
            availableUsers.forEach(user => {
                const label = document.createElement('label');
                label.className = 'flex items-center space-x-2 cursor-pointer hover:bg-gray-900 p-1 rounded';
                label.innerHTML = `
                    <input type="checkbox" name="members" value="${user.id}" class="rounded text-blue-500">
                    <span class="text-sm">${user.name} (${user.username})</span>
                `;
                memberCheckboxes.appendChild(label);
            });
        }
    }
}

// 팀 추가 모달 열기
function openAddTeamModal() {
    document.getElementById('addTeamModal').classList.remove('hidden');
    document.getElementById('addTeamForm').reset();
    loadAvailableUsers();
}

// 팀 추가 모달 닫기
function closeAddTeamModal() {
    document.getElementById('addTeamModal').classList.add('hidden');
}

// 팀원 관리 모달 열기
function openManageMembersModal(teamId) {
    const modal = document.getElementById('manageMembersModal');
    modal.classList.remove('hidden');
    document.getElementById('manageMembersTeamId').value = teamId;
    
    // 현재 팀 정보 로드
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return;
    
    // 현재 팀원 목록 표시
    const membersList = document.getElementById('currentMembersList');
    const memberCount = document.getElementById('currentMemberCount');
    membersList.innerHTML = '';
    memberCount.textContent = `${team.members.length}명`;
    
    if (team.members.length === 0) {
        membersList.innerHTML = '<p class="text-gray-400 text-center py-4">팀원이 없습니다</p>';
    } else {
        team.members.forEach(memberId => {
            const user = users.find(u => u.id === memberId);
            if (user) {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-gray-700/50';
                
                const isLeader = team.leader === memberId;
                memberDiv.innerHTML = `
                    <div class="flex items-center gap-3 flex-1">
                        <div class="w-10 h-10 rounded-full ${isLeader ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30' : 'bg-gray-700/50 border border-gray-600/50'} flex items-center justify-center">
                            <span class="text-sm font-bold ${isLeader ? 'text-amber-400' : 'text-gray-400'}">
                                ${user.name.charAt(0)}
                            </span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <p class="font-medium text-gray-200">${user.name}</p>
                                ${isLeader ? 
                                    `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full font-bold uppercase tracking-wide">
                                        <i class="fas fa-crown text-xs"></i>
                                        팀장
                                    </span>` : 
                                    ''
                                }
                            </div>
                            <p class="text-xs text-gray-400">${user.username} • ${user.department || '소속 없음'}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        ${!isLeader ? 
                            `<button 
                                onclick="makeLeader('${teamId}', '${memberId}')" 
                                class="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-xs font-medium transition-all duration-200"
                                title="팀장으로 지정"
                            >
                                <i class="fas fa-crown text-xs mr-1"></i>
                                팀장 지정
                            </button>` : 
                            ''
                        }
                        ${!isLeader ?
                            `<button 
                                onclick="removeMember('${teamId}', '${memberId}')" 
                                class="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-medium transition-all duration-200"
                            >
                                <i class="fas fa-user-minus text-xs mr-1"></i>
                                제거
                            </button>` :
                            ''
                        }
                    </div>
                `;
                membersList.appendChild(memberDiv);
            }
        });
    }
    
    // 추가 가능한 팀원 로드
    loadAvailableMembersForAdd(teamId);
}

// 팀원 관리 모달 닫기
function closeManageMembersModal() {
    document.getElementById('manageMembersModal').classList.add('hidden');
    loadTeams(); // 팀 목록 새로고침
}

// 추가 가능한 팀원 로드
function loadAvailableMembersForAdd(teamId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    const assignedUserIds = new Set();
    teams.forEach(team => {
        team.members.forEach(memberId => assignedUserIds.add(memberId));
    });
    
    const addSelect = document.getElementById('addMemberSelect');
    addSelect.innerHTML = '<option value="">추가할 팀원을 선택하세요</option>';
    
    users.filter(u => 
        (u.role === 'inspector' || u.role === 'team_leader' || u.role === 'team_member') && 
        !assignedUserIds.has(u.id)
    ).forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.username})`;
        addSelect.appendChild(option);
    });
}

// 팀원 추가
function addTeamMember() {
    const teamId = document.getElementById('manageMembersTeamId').value;
    const memberId = document.getElementById('addMemberSelect').value;
    
    if (!memberId) {
        showNotification('error', '추가할 팀원을 선택해주세요.');
        return;
    }
    
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].members.push(memberId);
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // 사용자의 teamId 업데이트
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex !== -1) {
            users[userIndex].teamId = teamId;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        openManageMembersModal(teamId); // 모달 새로고침
        showNotification('success', '팀원이 추가되었습니다.');
    }
}

// 팀원 제거
function removeMember(teamId, memberId) {
    if (!confirm('정말로 이 팀원을 제거하시겠습니까?')) return;
    
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].members = teams[teamIndex].members.filter(m => m !== memberId);
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // 사용자의 teamId 제거
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex !== -1) {
            users[userIndex].teamId = null;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        openManageMembersModal(teamId); // 모달 새로고침
        showNotification('success', '팀원이 제거되었습니다.');
    }
}

// 팀장 지정 (왕관 아이콘 클릭)
function makeLeader(teamId, memberId) {
    if (!confirm('이 팀원을 팀장으로 지정하시겠습니까?')) return;
    
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].leader = memberId;
        localStorage.setItem('teams', JSON.stringify(teams));
        
        openManageMembersModal(teamId); // 모달 새로고침
        showNotification('success', '팀장이 변경되었습니다.');
    }
}

// 팀 상태는 감식팀 배정 시 자동으로 변경됨 (수동 변경 제거)

// 팀 추가 폼 제출
document.getElementById('addTeamForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    // 선택된 팀원들
    const selectedMembers = [];
    const memberCheckboxes = document.querySelectorAll('input[name="members"]:checked');
    memberCheckboxes.forEach(checkbox => {
        selectedMembers.push(checkbox.value);
    });
    
    // 팀장도 members에 포함
    const leaderId = formData.get('teamLeader');
    if (leaderId && !selectedMembers.includes(leaderId)) {
        selectedMembers.push(leaderId);
    }
    
    // 새 팀 객체 생성
    const newTeam = {
        id: `TEAM-${Date.now()}`,
        name: formData.get('teamName'),
        leader: leaderId || null,
        members: selectedMembers,
        status: 'available',
        currentAssignment: null,
        totalResolved: 0,
        createdAt: new Date().toISOString()
    };
    
    // localStorage에 저장
    teams.push(newTeam);
    localStorage.setItem('teams', JSON.stringify(teams));
    
    // 사용자의 teamId 업데이트
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    selectedMembers.forEach(memberId => {
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex !== -1) {
            users[userIndex].teamId = newTeam.id;
        }
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    // UI 업데이트
    loadTeams();
    updateStatistics();
    closeAddTeamModal();
    
    showNotification('success', '팀이 성공적으로 등록되었습니다.');
});

// 기존 addMemberForm 이벤트 리스너는 제거 (새로운 팀원 관리 모달로 대체됨)

// 팀 편집
function editTeam(teamId) {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return;
    
    const newName = prompt('새 팀 이름:', team.name);
    if (newName && newName !== team.name) {
        team.name = newName;
        localStorage.setItem('teams', JSON.stringify(teams));
        loadTeams();
        showNotification('success', '팀 정보가 수정되었습니다.');
    }
}

// 팀 삭제
function deleteTeam(teamId) {
    if (!confirm('정말로 이 팀을 삭제하시겠습니까?')) return;
    
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) return;
    
    const team = teams[teamIndex];
    
    // 팀원들의 teamId 제거
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    team.members.forEach(memberId => {
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex !== -1) {
            users[userIndex].teamId = null;
        }
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    // 팀 삭제
    teams.splice(teamIndex, 1);
    localStorage.setItem('teams', JSON.stringify(teams));
    
    // UI 업데이트
    loadTeams();
    updateStatistics();
    
    showNotification('success', '팀이 삭제되었습니다.');
}

// 알림 표시
function showNotification(type, message) {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    };
    
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-xl shadow-2xl z-50 border-2 ${colors[type] || colors.info} backdrop-blur-sm`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} text-lg"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const addTeamModal = document.getElementById('addTeamModal');
        const manageMembersModal = document.getElementById('manageMembersModal');
        
        if (!addTeamModal.classList.contains('hidden')) {
            closeAddTeamModal();
        } else if (!manageMembersModal.classList.contains('hidden')) {
            closeManageMembersModal();
        }
    }
});