// toast.js

// 중복 방지용 Set
const shownToastIds = new Set();

// 토스트 표시 함수
function showToast(message, riskLevel, id = null) {
  // 이미 표시된 경우 중복 방지
  if (id && shownToastIds.has(id)) return;
  if (id) shownToastIds.add(id);

  // 토스트 컨테이너 생성 (없으면 body에 추가)
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '105px';   // 대시보드와 동일한 높이
    container.style.right = '16px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }

  // 위험도별 Tailwind 색상
  let riskColor = 'bg-yellow-600 text-gray-900 shadow-lg';
  if (riskLevel === 'high') riskColor = 'bg-red-700 text-white shadow-lg shadow-red-500/50';
  else if (riskLevel === 'medium') riskColor = 'bg-orange-600 text-white shadow-lg shadow-orange-500/50';

  const toast = document.createElement('div');
  toast.className = `flex items-center p-3 rounded-lg ${riskColor} animate-slide-in transform transition-all duration-300`;
  toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i><span>${message}</span>`;

  container.appendChild(toast);

  // 펄스 효과
  toast.animate([
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.1)', opacity: 0.8 },
    { transform: 'scale(1)', opacity: 1 }
  ], {
    duration: 1500,
    iterations: 1
  });

  // 5초 후 자동 제거
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-20');
    setTimeout(() => {
      toast.remove();
      if (id) shownToastIds.delete(id);
    }, 500);
  }, 5000);
}

// 최근 경고 자동 업데이트
function updateRecentAlerts() {
  const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
  const recentIncidents = incidents
  .filter(i => i.status === 'pending')
  .sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));

  if (!recentIncidents.length) return;

  // 최근 3건까지 표시
  recentIncidents.slice(0, 3).forEach(incident => {
    showToast(`${incident.location}에서 ${incident.objectType} 감지됨`, incident.riskLevel, incident.id);
  });
}

// 초기 실행 및 3초마다 업데이트
document.addEventListener('DOMContentLoaded', updateRecentAlerts);
setInterval(updateRecentAlerts, 3000);
