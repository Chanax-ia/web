let alarms = [];
let alarmTimeouts = [];
let searchHistory = [];
let fileUploads = [];
let appNotificationsEnabled = false;

// Función para enviar mensaje de chat
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message right';
        
        const messageLines = wrapText(message, 60);
        messageLines.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line;
            messageElement.appendChild(lineElement);
        });
        
        document.querySelector('.messages').appendChild(messageElement);
        input.value = '';
        document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
    }
}

// Función para envolver texto en líneas
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let line = '';
    while (words.length > 0) {
        if (line.length + words[0].length + 1 > maxWidth) {
            lines.push(line.trim());
            line = '';
        }
        line += (line.length ? ' ' : '') + words.shift();
    }
    if (line.length) {
        lines.push(line.trim());
    }
    return lines;
}

// Función para previsualizar imagen en el chat
function previewChatImage() {
    const input = document.getElementById('chatImageInput');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message right';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            messageElement.appendChild(img);
            document.querySelector('.messages').appendChild(messageElement);
            document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Función para previsualizar archivo en el chat
function previewChatFile() {
    const input = document.getElementById('chatFileInput');
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const messageElement = document.createElement('div');
            messageElement.className = 'message right';
            messageElement.innerHTML = `
                <div>${file.name}</div>
                <button onclick="downloadFile('${file.name}', '${file.type}')">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
            `;
            document.querySelector('.messages').appendChild(messageElement);
            document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
            fileUploads.push(file);
        } else {
            alert('Por favor, sube solo archivos PDF o Word.');
        }
    }
}

// Función para descargar archivo
function downloadFile(fileName, fileType) {
    const file = fileUploads.find(f => f.name === fileName && f.type === fileType);
    if (file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}// Función para crear una alarma (actualizada)
// Función para ajustar la interfaz en dispositivos móviles
function adjustForMobile() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.main').forEach(main => {
            main.style.minHeight = window.innerHeight + 'px';
        });
    }
}

// Evento para manejar cambios de orientación
window.addEventListener('orientationchange', adjustForMobile);

// Función para manejar el desplazamiento en dispositivos móviles
function handleMobileScroll() {
    if (window.innerWidth <= 768) {
        window.scrollTo(0, 0);
    }
}

// Agregar el evento de desplazamiento a los botones de navegación
document.querySelectorAll('.footer-button').forEach(button => {
    button.addEventListener('click', handleMobileScroll);
});

// Inicialización (ACTUALIZADA)
document.addEventListener('DOMContentLoaded', () => {
    showMain(1); // Mostrar la primera pestaña por defecto
    updateAlarmHistoryDisplay();
    adjustForMobile();
});

// ... (resto del código existente) ...

// Función para enviar mensaje de chat (ACTUALIZADA)
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message right';
        
        const messageLines = wrapText(message, 60);
        messageLines.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line;
            messageElement.appendChild(lineElement);
        });
        
        document.querySelector('.messages').appendChild(messageElement);
        input.value = '';
        document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
    }
}
function createAlarm() {
    const time = document.getElementById('alarmTime').value;
    const description = document.getElementById('alarmDescription').value;
    const days = Array.from(document.getElementById('alarmDays').selectedOptions).map(option => {
        const daysInSpanish = {
            'monday': 'Lunes',
            'tuesday': 'Martes',
            'wednesday': 'Miércoles',
            'thursday': 'Jueves',
            'friday': 'Viernes',
            'saturday': 'Sábado',
            'sunday': 'Domingo'
        };
        return daysInSpanish[option.value];
    });
    const repeatInterval = document.getElementById('repeatInterval').value;
    const repeatUnit = document.getElementById('repeatUnit').value;
    
    if (time && description) {
        const alarm = { 
            time, 
            description, 
            days, 
            repeatInterval, 
            repeatUnit,
            sound: 'default', 
            id: Date.now() 
        };
        alarms.push(alarm);
        updateAlarmList();
        alert('Alarma creada');
        
        scheduleAlarm(alarm);
        scheduleNotifications(alarm);
    }
}

// Función para programar alarma (actualizada)
function scheduleAlarm(alarm) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    const now = new Date();
    const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const timeout = setTimeout(() => {
        showNotificationPopup(alarm);
        if (alarm.repeatInterval && alarm.repeatUnit) {
            rescheduleAlarm(alarm);
        }
    }, alarmTime - now);
    
    alarmTimeouts.push({ id: alarm.id, timeout });
}

// Función para reprogramar alarma
function rescheduleAlarm(alarm) {
    const intervalMs = getIntervalInMs(alarm.repeatInterval, alarm.repeatUnit);
    const newAlarm = {...alarm, id: Date.now()};
    alarms.push(newAlarm);
    setTimeout(() => {
        scheduleAlarm(newAlarm);
    }, intervalMs);
}

// Función para obtener intervalo en milisegundos
function getIntervalInMs(interval, unit) {
    const msPerUnit = {
        'minutes': 60000,
        'hours': 3600000,
        'days': 86400000
    };
    return interval * msPerUnit[unit];
}

// Función para programar notificaciones (actualizada)
function scheduleNotifications(alarm) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);
    
    const notificationTime = new Date(alarmTime.getTime() - 5 * 60000); // 5 minutos antes
    
    const now = new Date();
    if (notificationTime > now) {
        setTimeout(() => {
            if (appNotificationsEnabled) {
                notifyApp(alarm);
            }
            sendEmail(alarm);
            sendSMS(alarm);
        }, notificationTime - now);
    }
}// Función para mostrar notificación de alarma (actualizada)
function showNotificationPopup(alarm) {
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.innerHTML = `
        <div>La alarma para ${alarm.description} ha sonado.</div>
        <button class="green" onclick="markAlarmAsCompleted(${alarm.id})">Completada</button>
        <button class="red" onclick="markAlarmAsMissed(${alarm.id})">Perdida</button>
    `;
    document.body.appendChild(popup);
    popup.style.display = 'block';
    
    // Reproducir sonido de alarma
    playAlarmSound();
    
    // Vibrar el dispositivo
    if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    setTimeout(() => {
        if (document.body.contains(popup)) {
            markAlarmAsMissed(alarm.id);
        }
    }, 30000);
}

// Función para reproducir sonido de alarma
function playAlarmSound() {
    // Aquí se puede implementar la lógica para reproducir el sonido predeterminado del dispositivo
    console.log("Reproduciendo sonido de alarma");
}

// Función para actualizar la lista de alarmas (actualizada)
function updateAlarmList() {
    const list = document.getElementById('alarmList');
    list.innerHTML = '';
    alarms.forEach(alarm => {
        const item = document.createElement('div');
        item.className = 'alarm-history';
        item.innerHTML = `
            <div>
                <div>${alarm.description}</div>
                <div>Hora: ${alarm.time}</div>
                <div>Días: ${alarm.days.join(', ')}</div>
                <div>Repetir cada: ${alarm.repeatInterval} ${alarm.repeatUnit}</div>
            </div>
            <div class="alarm-actions">
                <button class="delete" onclick="confirmDeleteAlarm(${alarm.id})"></button>
                <button class="edit" onclick="editAlarm(${alarm.id})">Editar</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Función para confirmar eliminación de alarma
function confirmDeleteAlarm(id) {
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <p>¿Estás seguro de que quieres eliminar esta alarma?</p>
        <button class="yes" onclick="deleteAlarm(${id})">Sí</button>
        <button class="no" onclick="this.parentElement.remove()">No</button>
    `;
    document.body.appendChild(dialog);
}

// Función para eliminar una alarma
function deleteAlarm(id) {
    const index = alarms.findIndex(a => a.id === id);
    if (index !== -1) {
        alarms.splice(index, 1);
        updateAlarmList();
        const timeoutIndex = alarmTimeouts.findIndex(t => t.id === id);
        if (timeoutIndex !== -1) {
            clearTimeout(alarmTimeouts[timeoutIndex].timeout);
            alarmTimeouts.splice(timeoutIndex, 1);
        }
    }
    document.querySelector('.confirmation-dialog').remove();
}

// Función para editar una alarma
function editAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        document.getElementById('alarmTime').value = alarm.time;
        document.getElementById('alarmDescription').value = alarm.description;
        document.getElementById('alarmDays').value = alarm.days.map(day => {
            const daysInEnglish = {
                'Lunes': 'monday',
                'Martes': 'tuesday',
                'Miércoles': 'wednesday',
                'Jueves': 'thursday',
                'Viernes': 'friday',
                'Sábado': 'saturday',
                'Domingo': 'sunday'
            };
            return daysInEnglish[day];
        });
        document.getElementById('repeatInterval').value = alarm.repeatInterval;
        document.getElementById('repeatUnit').value = alarm.repeatUnit;
        
        // Eliminar la alarma existente
        deleteAlarm(id);
        
        // Mostrar un mensaje para que el usuario sepa que está editando
        alert('Editando alarma. Haz los cambios necesarios y presiona "Crear Alarma" para guardar.');
    }
}

// Función para marcar alarma como completada
function markAlarmAsCompleted(id) {
    updateAlarmHistory(id, 'Completada');
    document.querySelector('.notification-popup').remove();
}

// Función para marcar alarma como perdida
function markAlarmAsMissed(id) {
    updateAlarmHistory(id, 'Perdida');
    document.querySelector('.notification-popup').remove();
}

// Función para actualizar el historial de alarmas
function updateAlarmHistory(id, status) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.status = status;
        alarm.completionTime = new Date().toLocaleString();
    }
    updateAlarmHistoryDisplay();
}// Función para actualizar la visualización del historial de alarmas
function updateAlarmHistoryDisplay() {
    const historyElement = document.getElementById('alarmHistory');
    historyElement.innerHTML = '<h3>Historial de Alarmas</h3>';
    
    const sortedAlarms = alarms.filter(a => a.status).sort((a, b) => {
        return new Date(b.completionTime) - new Date(a.completionTime);
    });
    
    sortedAlarms.forEach(alarm => {
        const alarmElement = document.createElement('div');
        alarmElement.className = `alarm-history ${alarm.status.toLowerCase()}`;
        alarmElement.innerHTML = `
            <span class="alarm-status-indicator ${alarm.status.toLowerCase()}"></span>
            <div>${alarm.description}</div>
            <div>Hora: ${alarm.time}</div>
            <div>Estado: ${alarm.status}</div>
            <div>Completada/Perdida: ${alarm.completionTime}</div>
        `;
        historyElement.appendChild(alarmElement);
    });
}

// Función para compartir el historial de alarmas
function shareAlarmHistory() {
    const method = document.getElementById('shareMethod').value;
    const contact = document.getElementById('shareContact').value;
    
    if (!contact) {
        alert('Por favor, ingresa un contacto válido.');
        return;
    }
    
    const historyText = alarms.filter(a => a.status).map(a => 
        `Alarma: ${a.description}, Hora: ${a.time}, Estado: ${a.status}, Completada/Perdida: ${a.completionTime}`
    ).join('\n');
    
    if (method === 'email') {
        window.open(`mailto:${contact}?subject=Historial de Alarmas&body=${encodeURIComponent(historyText)}`, '_blank');
    } else if (method === 'whatsapp') {
        window.open(`https://wa.me/${contact}?text=${encodeURIComponent(historyText)}`, '_blank');
    }
}

// Función para activar/desactivar notificaciones de la app
function toggleAppNotifications() {
    appNotificationsEnabled = !appNotificationsEnabled;
    alert(appNotificationsEnabled ? 'Notificaciones de app activadas' : 'Notificaciones de app desactivadas');
}

// Función para enviar correo (sin cambios)
function sendEmail(alarm) {
    const subject = "Recordatorio de alarma";
    const body = `Tu alarma "${alarm.description}" sonará en 5 minutos.`;
    window.open(`mailto:lopezmunozkevinsantiago6@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
}

// Función para enviar SMS (sin cambios)
function sendSMS(alarm) {
    const phoneNumber = "1234567890";
    const message = `Tu alarma "${alarm.description}" sonará en 5 minutos.`;
    console.log(`Enviando mensaje de texto a ${phoneNumber}: ${message}`);
}

// Función para notificar a la app (actualizada)
function notifyApp(alarm) {
    if ("Notification" in window) {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification(`Alarma: ${alarm.description}`, {
                    body: `Tu alarma sonará en 5 minutos.`,
                    icon: "/path/to/icon.png"
                });
            }
        });
    }
}

// Funciones auxiliares (sin cambios)
function contactSupport() {
    console.log("Contactando soporte técnico");
}

function viewTerms() {
    console.log("Mostrando términos y condiciones");
}

function selectProfileImage() {
    document.getElementById('profileImageInput').click();
}

function previewProfileImage() {
    const input = document.getElementById('profileImageInput');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImg').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateProfileName() {
    const profileName = document.getElementById('profileName').value;
    console.log(`Nombre de perfil actualizado: ${profileName}`);
}

function showMain(mainNumber) {
    // Ocultar todas las secciones principales
    document.querySelectorAll('.main').forEach(main => {
        main.classList.remove('show');
    });
    
    // Mostrar la sección principal seleccionada
    document.getElementById(`main${mainNumber}`).classList.add('show');
}

// Event listeners (ACTUALIZADOS)
document.getElementById('sendMessageButton').addEventListener('click', sendMessage);
document.getElementById('chatImageInput').addEventListener('change', previewChatImage);
document.getElementById('chatFileInput').addEventListener('change', previewChatFile);
document.getElementById('toggleAlarmHistory').addEventListener('click', function() {
    const historyElement = document.getElementById('alarmHistory');
    historyElement.classList.toggle('hidden');
    this.textContent = historyElement.classList.contains('hidden') ? 'Mostrar Historial de Alarmas' : 'Ocultar Historial de Alarmas';
});

// Inicialización (ACTUALIZADA)
document.addEventListener('DOMContentLoaded', () => {
    showMain(1); // Mostrar la primera pestaña por defecto
    updateAlarmHistoryDisplay();
});