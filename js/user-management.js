// 계정 관리 페이지 스크립트

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    updateStatistics();
    loadTeamsForDropdown();
});

// 사용자 목록 로드
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.getElementById('user-tbody');
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = createUserRow(user);
        tbody.appendChild(tr);
    });
}

// 사용자 행 생성
function createUserRow(user) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-700/50';
    
    const roleLabels = {
        admin: { text: '관리자', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
        control: { text: '관재팀', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
        supervisor: { text: '관재팀', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
        inspector: { text: '감식팀', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' },
        team_leader: { text: '감식팀', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' },
        team_member: { text: '감식팀', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' }
    };
    
    const role = roleLabels[user.role] || { text: user.role, color: 'bg-gray-700/50 text-gray-400 border border-gray-600/50' };
    
    tr.innerHTML = `
        <td class="px-6 py-4">
            <span class="text-blue-400 font-medium flex items-center gap-2">
                <i class="fas fa-user-circle text-gray-500 text-sm"></i>
                ${user.username}
            </span>
        </td>
        <td class="px-6 py-4 text-gray-300">${user.name}</td>
        <td class="px-6 py-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${role.color}">
                <i class="fas ${
                    user.role === 'admin' ? 'fa-shield-alt' : 
                    user.role === 'control' || user.role === 'supervisor' ? 'fa-desktop' : 
                    'fa-hard-hat'
                } text-xs"></i>
                ${role.text}
            </span>
        </td>
        <td class="px-6 py-4">
            <span class="text-gray-400 bg-gray-800/50 px-2 py-1 rounded-md text-sm">
                ${user.department}
            </span>
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2 text-gray-400">
                <i class="far fa-envelope text-xs"></i>
                <span class="text-sm">${user.email}</span>
            </div>
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2 text-gray-400">
                <i class="fas fa-phone text-xs"></i>
                <span class="text-sm">${user.phone}</span>
            </div>
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2 text-gray-400">
                <i class="far fa-calendar text-xs"></i>
                <span class="text-sm">${formatDate(user.createdAt)}</span>
            </div>
        </td>
        <td class="px-6 py-4">
            <div class="flex gap-2">
                <button onclick="editUser('${user.id}')" 
                    class="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50">
                    <i class="fas fa-edit text-sm"></i>
                </button>
                <button onclick="deleteUser('${user.id}')" 
                    class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </td>
    `;
    
    return tr;
}

// 통계 업데이트
function updateStatistics() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const stats = {
        total: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        supervisor: users.filter(u => u.role === 'control' || u.role === 'supervisor').length,
        teamMember: users.filter(u => u.role === 'inspector' || u.role === 'team_leader' || u.role === 'team_member').length
    };
    
    document.getElementById('total-users').textContent = stats.total;
    document.getElementById('admin-count').textContent = stats.admin;
    document.getElementById('supervisor-count').textContent = stats.supervisor;
    document.getElementById('team-member-count').textContent = stats.teamMember;
}

// 날짜 포맷
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 팀 목록 로드 (드롭다운용)
function loadTeamsForDropdown() {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const select = document.querySelector('select[name="teamId"]');
    
    select.innerHTML = '<option value="">없음</option>';
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        select.appendChild(option);
    });
}

// 모달 열기
function openAddUserModal() {
    document.getElementById('addUserModal').classList.remove('hidden');
    document.getElementById('addUserForm').reset();
}

// 모달 닫기
function closeAddUserModal() {
    document.getElementById('addUserModal').classList.add('hidden');
}

// 사용자 추가 폼 제출
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 아이디 중복 체크
    const username = formData.get('username');
    if (users.some(u => u.username === username)) {
        alert('이미 존재하는 아이디입니다.');
        return;
    }
    
    // 새 사용자 객체 생성
    const newUser = {
        id: `USER-${Date.now()}`,
        username: formData.get('username'),
        password: formData.get('password'),
        name: formData.get('name'),
        role: formData.get('role'),
        department: formData.get('department'),
        teamId: formData.get('teamId') || null,
        email: formData.get('email'),
        phone: formData.get('phone'),
        createdAt: new Date().toISOString()
    };
    
    // localStorage에 저장
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 팀에 멤버 추가 (감식반인 경우)
    if (newUser.teamId && (newUser.role === 'inspector' || newUser.role === 'team_leader' || newUser.role === 'team_member')) {
        const teams = JSON.parse(localStorage.getItem('teams') || '[]');
        const teamIndex = teams.findIndex(t => t.id === newUser.teamId);
        
        if (teamIndex !== -1) {
            teams[teamIndex].members.push(newUser.id);
            
            // 팀장인 경우 리더 설정
            if (newUser.role === 'team_leader') {
                teams[teamIndex].leader = newUser.id;
            }
            
            localStorage.setItem('teams', JSON.stringify(teams));
        }
    }
    
    // UI 업데이트
    loadUsers();
    updateStatistics();
    closeAddUserModal();
    
    // 성공 메시지
    showNotification('success', '계정이 성공적으로 등록되었습니다.');
});

// 사용자 편집
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // 편집 모달 열기 (간단히 처리)
    const newName = prompt('새 이름:', user.name);
    if (newName && newName !== user.name) {
        user.name = newName;
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        showNotification('success', '계정 정보가 수정되었습니다.');
    }
}

// 사용자 삭제
function deleteUser(userId) {
    if (!confirm('정말로 이 계정을 삭제하시겠습니까?')) return;
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    const user = users[userIndex];
    
    // 팀에서 멤버 제거
    if (user.teamId) {
        let teams = JSON.parse(localStorage.getItem('teams') || '[]');
        const teamIndex = teams.findIndex(t => t.id === user.teamId);
        
        if (teamIndex !== -1) {
            teams[teamIndex].members = teams[teamIndex].members.filter(m => m !== userId);
            
            // 팀장인 경우 리더 제거
            if (teams[teamIndex].leader === userId) {
                teams[teamIndex].leader = teams[teamIndex].members[0] || null;
            }
            
            localStorage.setItem('teams', JSON.stringify(teams));
        }
    }
    
    // 사용자 삭제
    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));
    
    // UI 업데이트
    loadUsers();
    updateStatistics();
    
    showNotification('success', '계정이 삭제되었습니다.');
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
        const modal = document.getElementById('addUserModal');
        if (!modal.classList.contains('hidden')) {
            closeAddUserModal();
        }
    }
});