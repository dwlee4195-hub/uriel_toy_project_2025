// 공통 인증 및 헤더 관리 스크립트

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function () {
	// 로그인 체크
	checkAuth();

	// 사용자 정보 헤더 추가
	addUserHeader();
});

// 로그인 체크 함수
function checkAuth() {
	const currentUser = window.dataManager.getCurrentUser();

	if (!currentUser) {
		// 로그인되지 않은 경우 로그인 페이지로 리다이렉트
		window.location.href = 'login.html';
		return false;
	}

	return true;
}

// 사용자 정보 헤더 추가
function addUserHeader() {
	const currentUser = window.dataManager.getCurrentUser();

	if (!currentUser) return;


	// 페이지 콘텐츠에 상단 여백 추가 (헤더 높이만큼)
	const mainContent = document.querySelector('body > div:not(#userHeader):not(#mobileUserHeader):not(#sidebar-container)');
	if (mainContent && !mainContent.classList.contains('pt-20')) {
		mainContent.classList.add('pt-20');
	}
}

// 로그아웃 함수
function logout() {
	window.dataManager.logout();
	
	// 성공 메시지 표시 (알림 시스템이 로드되어 있으면)
	if (typeof showSuccess === 'function') {
		showSuccess('로그아웃 되었습니다.');
		setTimeout(() => {
			window.location.href = 'login.html';
		}, 1000);
	} else {
		window.location.href = 'login.html';
	}
}

// storage 이벤트 리스너 (다른 탭에서 로그아웃 시 감지)
window.addEventListener('storage', function (e) {
	if (e.key === 'currentSession') {
		const newSession = JSON.parse(e.newValue);
		if (!newSession) {
			// 다른 탭에서 로그아웃됨
			if (typeof showWarning === 'function') {
				showWarning('다른 탭에서 로그아웃되었습니다.');
				setTimeout(() => {
					window.location.href = 'login.html';
				}, 1500);
			} else {
				window.location.href = 'login.html';
			}
		}
	}
});