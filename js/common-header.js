// 공통 헤더 컴포넌트
const CommonHeader = {
    // 사용자 정보 가져오기
    getUserInfo: function() {
        // dataManager에서 현재 로그인된 사용자 정보 가져오기
        if (window.dataManager && window.dataManager.getCurrentUser) {
            const currentUser = window.dataManager.getCurrentUser();
            if (currentUser) {
                return {
                    name: currentUser.name,
                    email: currentUser.username + '@urielsoft.com',
                    role: this.getRoleLabel(currentUser.role),
                    department: currentUser.department || '소속 없음'
                };
            }
        }
        // 기본값 (데모용)
        return {
            name: '로그인 필요',
            email: '',
            role: '인증 대기'
        };
    },
    
    // 역할 한글 변환
    getRoleLabel: function(role) {
        const roleLabels = {
            admin: '관리자',
            control: '관제팀',
            supervisor: '관제팀',
            inspector: '감식팀',
            team_leader: '감식팀',
            team_member: '감식팀'
        };
        return roleLabels[role] || role;
    },

    // 헤더 HTML 생성
    createHeader: function(title, subtitle) {
        const user = this.getUserInfo();
        
        return `
        <header class="bg-light-secondary shadow-lg">
            <div class="h-20 px-8 flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                        ${title}
                    </h1>
                    ${subtitle ? `<p class="text-sm text-gray-600 mt-1">${subtitle}</p>` : ''}
                </div>
                
                <!-- 상단 우측 영역 -->
                <div class="flex items-center space-x-6">
                    <!-- 현재 시간 표시 -->
                    <div class="text-sm text-gray-600">
                        <i class="far fa-clock mr-2"></i>
                        <span id="current-time">${new Date().toLocaleString('ko-KR')}</span>
                    </div>
                    
                    
                    <!-- 사용자 정보 -->
                    <div class="flex items-center border-l pl-6">
                        <div class="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-user text-white"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${user.name}</p>
                            <p class="text-xs text-gray-500">${user.role}</p>
                        </div>
                        
                        <!-- 로그아웃 버튼 -->
                        <button onclick="CommonHeader.handleLogout()" class="ml-4 text-gray-500 hover:text-gray-700" title="로그아웃">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>
        `;
    },

    // 헤더 초기화
    init: function(containerId, title, subtitle) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.createHeader(title, subtitle);
            this.startClock();
        }
    },

    // 실시간 시계
    startClock: function() {
        setInterval(() => {
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = new Date().toLocaleString('ko-KR');
            }
        }, 1000);
    },
    
    // 로그아웃 처리
    handleLogout: function() {
        if (window.dataManager && window.dataManager.logout) {
            window.dataManager.logout();
        }
        // localStorage에서 세션 정보 삭제
        localStorage.removeItem('currentSession');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authToken');
        
        // 로그인 페이지로 이동
        alert('로그아웃되었습니다.');
        window.location.href = 'login.html';
    }
};

// 전역 로그아웃 함수 (이전 버전 호환성)
function logout() {
    CommonHeader.handleLogout();
}