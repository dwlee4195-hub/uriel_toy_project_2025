// 공통 사이드바 템플릿
function getSidebarHTML() {
    // 현재 로그인 사용자 정보 가져오기
    const currentUser = window.dataManager ? window.dataManager.getCurrentUser() : null;
    const userRole = currentUser ? currentUser.role : 'guest';
    
    // 역할별 메뉴 표시 여부
    const showManagement = userRole === 'admin'; // 관리자만 시스템 관리 메뉴 표시
    
    return `
    <aside class="w-64 bg-light-secondary min-h-screen flex flex-col border-r border-gray-200">
        <!-- 로고 영역 -->
        <div class="h-20 flex items-center px-6 border-b border-gray-200">
            <a href="dashboard.html" class="hover:opacity-80 transition-opacity">
                <img src="Uriel_CI(png)/Uriel_logo.png" alt="Uriel Logo" class="h-10 w-auto cursor-pointer">
            </a>
        </div>
        
        <!-- 네비게이션 메뉴 -->
        <nav class="flex-1 py-6">
            <!-- 관제 운영 섹션 -->
            <div class="mb-6">
                <h2 class="px-6 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    관제 운영
                </h2>
                <ul>
                    <li>
                        <a href="dashboard.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="dashboard">
                            <i class="fas fa-tachometer-alt mr-3 w-5"></i>
                            <span>대시보드</span>
                        </a>
                    </li>
                    <li>
                        <a href="incident-list.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="incident-list">
                            <i class="fas fa-desktop mr-3 w-5"></i>
                            <span>방치물품 처리 현황</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            <!-- 분석 및 통계 섹션 -->
            <div class="mb-6">
                <h2 class="px-6 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    분석 및 통계
                </h2>
                <ul>
                    <li>
                        <a href="analytics.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="analytics">
                            <i class="fas fa-chart-bar mr-3 w-5"></i>
                            <span>주간 통계</span>
                        </a>
                    </li>
                    <li>
                        <a href="monthly-analytics.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="monthly-analytics">
                            <i class="fas fa-chart-line mr-3 w-5"></i>
                            <span>월간 통계</span>
                        </a>
                    </li>
                    <li>
                        <a href="ai-analytics.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="ai-analytics">
                            <i class="fas fa-brain mr-3 w-5"></i>
                            <span>AI 분석 통계</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            ${
            showManagement ? `
            <!-- 시스템 관리 섹션 (관리자만) -->
            <div class="mb-6">
                <h2 class="px-6 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    시스템 관리
                </h2>
                <ul>
                    <li>
                        <a href="user-management.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="user-management">
                            <i class="fas fa-users mr-3 w-5"></i>
                            <span>계정 관리</span>
                        </a>
                    </li>
                    <li>
                        <a href="team-management.html" class="nav-link flex items-center px-6 py-3 hover:bg-light-tertiary transition-colors" data-page="team-management">
                            <i class="fas fa-users-cog mr-3 w-5"></i>
                            <span>감식팀 관리</span>
                        </a>
                    </li>
                </ul>
            </div>
            ` : ''
            }
        </nav>
        
    </aside>
`;
}

// 사이드바 초기화 함수
function initSidebar() {
    const container = document.getElementById('sidebar-container');
    if (container) {
        container.innerHTML = getSidebarHTML();
        
        // 현재 페이지 하이라이트
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const page = link.dataset.page;
            if (page && currentPage === page) {
                link.classList.add('bg-light-tertiary', 'border-l-4', 'border-primary-blue', 'text-gray-900');
            }
        });
    }
}

// 즉시 실행 - DOM 로드를 기다리지 않고 바로 실행
(function() {
    // DOM이 준비되었는지 확인
    if (document.readyState === 'loading') {
        // DOM이 아직 로딩 중이면 DOMContentLoaded 이벤트 대기
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        // DOM이 이미 로드되었으면 즉시 실행
        initSidebar();
    }
})();