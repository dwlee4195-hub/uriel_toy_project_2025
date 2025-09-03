// 간단한 공통 네비게이션 삽입 스크립트
(function() {
    // 네비게이션 HTML
    const navHTML = `
        <!-- 사이드바 메뉴 -->
        <aside class="w-64 bg-gray-800 text-white min-h-screen">
            <!-- 로고 영역 -->
            <div class="p-6 border-b border-gray-700">
                <a href="index.html" class="block">
                    <h2 class="text-xl font-bold">공항 관제 시스템</h2>
                    <p class="text-sm text-gray-400 mt-1">UrielSoft</p>
                </a>
            </div>
            
            <!-- 네비게이션 메뉴 -->
            <nav class="p-4">
                <ul class="space-y-2">
                    <li>
                        <a href="incident-list.html" class="nav-link block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-list mr-3"></i>사건 목록
                        </a>
                    </li>
                    <li>
                        <a href="incident-detail.html" class="nav-link block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-file-alt mr-3"></i>사건 상세
                        </a>
                    </li>
                    <li>
                        <a href="analytics.html" class="nav-link block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-chart-bar mr-3"></i>통계 분석
                        </a>
                    </li>
                    <li>
                        <a href="team-management.html" class="nav-link block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-users mr-3"></i>팀 관리
                        </a>
                    </li>
                    <li>
                        <a href="user-management.html" class="nav-link block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-user-cog mr-3"></i>사용자 관리
                        </a>
                    </li>
                </ul>
            </nav>
            
            <!-- 하단 로그아웃 -->
            <div class="absolute bottom-4 left-4 right-4">
                <a href="login.html" class="block px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                </a>
            </div>
        </aside>
    `;
    
    // DOM이 로드되면 실행
    document.addEventListener('DOMContentLoaded', function() {
        // nav-placeholder가 있으면 네비게이션 삽입
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder) {
            navPlaceholder.innerHTML = navHTML;
            
            // 현재 페이지 하이라이트
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPage) {
                    link.classList.add('bg-gray-700', 'font-bold');
                }
            });
        }
    });
})();