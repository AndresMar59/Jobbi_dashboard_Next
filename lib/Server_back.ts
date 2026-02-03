// npm install mixpanel

import { time } from "console";

// import the Mixpanel class
const Mixpanel = require('mixpanel');
 
// create an instance of the mixpanel object
const mp = Mixpanel.init('YOUR_MIXPANEL_PROJECT_TOKEN');

// track an event with properties
mp.track('Job_create', {
    distinct_id: 'user_company_id',
    timestamp: new Date().toISOString() 
});


mp.track('Invite_User_company', {
    distinct_id: 'user_company_id',
    timestamp: new Date().toISOString()  
});

mp.track('Active_Payroll', {
    distinct_id: 'user_company_id',
    timestamp: new Date().toISOString() 
});

mp.track('New_Payroll', {
    distinct_id: 'user_company_id',
    timestamp: new Date().toISOString() 
});

mp.track('Invoice_Payment_succes', {
    distinct_id: 'user_company_id',
    timestamp: new Date().toISOString() 
});

mp.track('Suscription_succes', {
    distinct_id: 'user_company_id',
    timestamp: new Date().toISOString() 
});