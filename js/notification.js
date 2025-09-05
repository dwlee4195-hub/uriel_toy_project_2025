// 예쁜 알림 시스템
const Notification = {
    // 알림 컨테이너 생성
    createContainer: function() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            
            // 모바일 여부 체크
            const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // 모바일이면 하단에, 데스크톱이면 상단에 표시
            if (isMobile) {
                container.className = 'fixed bottom-20 left-4 right-4 z-50 space-y-3';
            } else {
                container.className = 'fixed top-4 right-4 z-50 space-y-3';
            }
            
            document.body.appendChild(container);
        }
        return document.getElementById('notification-container');
    },

    // 알림 표시
    show: function(message, type = 'info', duration = 3000) {
        const container = this.createContainer();
        const id = 'notification-' + Date.now();
        
        // 타입별 스타일 설정 (다크 테마)
        const styles = {
            success: {
                bg: 'bg-gradient-to-r from-green-900/90 to-emerald-900/90',
                border: 'border-2 border-green-500/50',
                text: 'text-green-200',
                icon: 'fa-check-circle',
                iconColor: 'text-green-400',
                iconBg: 'bg-green-500/20'
            },
            error: {
                bg: 'bg-gradient-to-r from-red-900/90 to-pink-900/90',
                border: 'border-2 border-red-500/50',
                text: 'text-red-200',
                icon: 'fa-exclamation-circle',
                iconColor: 'text-red-400',
                iconBg: 'bg-red-500/20'
            },
            warning: {
                bg: 'bg-gradient-to-r from-yellow-900/90 to-orange-900/90',
                border: 'border-2 border-yellow-500/50',
                text: 'text-yellow-200',
                icon: 'fa-exclamation-triangle',
                iconColor: 'text-yellow-400',
                iconBg: 'bg-yellow-500/20'
            },
            info: {
                bg: 'bg-gradient-to-r from-blue-900/90 to-cyan-900/90',
                border: 'border-2 border-blue-500/50',
                text: 'text-blue-200',
                icon: 'fa-info-circle',
                iconColor: 'text-blue-400',
                iconBg: 'bg-blue-500/20'
            }
        };

        const style = styles[type] || styles.info;
        
        // 알림 HTML 생성
        const notificationHTML = `
            <div id="${id}" class="${style.bg} ${style.border} ${style.text} px-5 py-4 pr-12 rounded-xl shadow-2xl flex items-center space-x-3 backdrop-blur-sm transform transition-all duration-300 translate-x-0 opacity-100">
                <div class="${style.iconBg} p-2 rounded-full">
                    <i class="fas ${style.icon} ${style.iconColor} text-lg"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                </div>
                <button onclick="Notification.close('${id}')" class="absolute top-2 right-2 ${style.iconColor} hover:opacity-75 rounded-full w-6 h-6 flex items-center justify-center transition-opacity">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
        `;
        
        // 알림 추가
        container.insertAdjacentHTML('beforeend', notificationHTML);
        
        // 애니메이션 효과
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.style.transform = 'translateX(0)';
                element.style.opacity = '1';
            }
        }, 10);
        
        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                this.close(id);
            }, duration);
        }
        
        return id;
    },

    // 알림 닫기
    close: function(id) {
        const element = document.getElementById(id);
        if (element) {
            const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            element.style.transition = 'all 0.3s';
            
            // 모바일이면 아래로, 데스크톱이면 오른쪽으로 사라짐
            if (isMobile) {
                element.style.transform = 'translateY(100px)';
            } else {
                element.style.transform = 'translateX(100px)';
            }
            
            element.style.opacity = '0';
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    },

    // 편의 메서드들
    success: function(message, duration) {
        return this.show(message, 'success', duration);
    },

    error: function(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning: function(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info: function(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// 전역 함수로 등록
window.showNotification = Notification.show.bind(Notification);
window.showSuccess = Notification.success.bind(Notification);
window.showError = Notification.error.bind(Notification);
window.showWarning = Notification.warning.bind(Notification);
window.showInfo = Notification.info.bind(Notification);