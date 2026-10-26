import { bootstrapApplication } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  addOutline,
  alertCircleOutline,
  arrowBackOutline,
  barChartOutline,
  calendarOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  chevronDownOutline,
  closeCircleOutline,
  documentTextOutline,
  downloadOutline,
  eyeOffOutline,
  eyeOutline,
  fileTrayOutline,
  helpCircleOutline,
  informationCircleOutline,
  listOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  personCircleOutline,
  refreshOutline,
  schoolOutline,
  searchOutline,
  timeOutline,
  trashOutline,
  warningOutline,
} from 'ionicons/icons';

import { App } from './app/app';
import { appConfig } from './app/app.config';

// Los iconos se registran una sola vez: así el bundle solo incluye los que se usan.
addIcons({
  'add-outline': addOutline,
  'alert-circle-outline': alertCircleOutline,
  'arrow-back-outline': arrowBackOutline,
  'bar-chart-outline': barChartOutline,
  'calendar-outline': calendarOutline,
  'checkmark-circle': checkmarkCircle,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'chevron-down-outline': chevronDownOutline,
  'close-circle-outline': closeCircleOutline,
  'document-text-outline': documentTextOutline,
  'download-outline': downloadOutline,
  'eye-off-outline': eyeOffOutline,
  'eye-outline': eyeOutline,
  'file-tray-outline': fileTrayOutline,
  'help-circle-outline': helpCircleOutline,
  'information-circle-outline': informationCircleOutline,
  'list-outline': listOutline,
  'lock-closed-outline': lockClosedOutline,
  'log-out-outline': logOutOutline,
  'mail-outline': mailOutline,
  'person-circle-outline': personCircleOutline,
  'refresh-outline': refreshOutline,
  'school-outline': schoolOutline,
  'search-outline': searchOutline,
  'time-outline': timeOutline,
  'trash-outline': trashOutline,
  'warning-outline': warningOutline,
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
