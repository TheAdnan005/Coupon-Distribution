
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

const coupons = [
    "SPRING25OFF", "SUMMER30NOW", "FALL20DEAL", "WINTER15YOU",
    "FLASH50TODAY", "WEEKEND40FUN", "SPECIAL35NOW", "HOLIDAY45JOY"
];

let currentCouponIndex = 0;
const ipClaimRecords = new Map(); 

function canClaimCoupon(ip) {
    if (ipClaimRecords.has(ip)) {
        const lastClaimTime = ipClaimRecords.get(ip);
        const currentTime = Date.now();
        const hoursSinceLastClaim = (currentTime - lastClaimTime) / (1000 * 60 * 60);
        
        return hoursSinceLastClaim >= 1; 
    }
    return true; 
}

function getTimeRemaining(ip) {
    if (!ipClaimRecords.has(ip)) return 0;
    
    const lastClaimTime = ipClaimRecords.get(ip);
    const currentTime = Date.now();
    const elapsedTimeMs = currentTime - lastClaimTime;
    const remainingTimeMs = (60 * 60 * 1000) - elapsedTimeMs;
    
    return Math.max(0, Math.floor(remainingTimeMs / 1000)); 
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/claim-coupon', (req, res) => {
    const clientIP = req.ip;
    const existingCoupon = req.cookies.claimedCoupon;

    if (!canClaimCoupon(clientIP)) {
        const remainingTime = getTimeRemaining(clientIP);
        return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded',
            remainingSeconds: remainingTime
        });
    }
    
    const couponCode = coupons[currentCouponIndex];
    currentCouponIndex = (currentCouponIndex + 1) % coupons.length;
    
    ipClaimRecords.set(clientIP, Date.now());
    
    res.cookie('claimedCoupon', couponCode, { 
        maxAge: 24 * 60 * 60 * 1000, 
        httpOnly: true
    });
    
    res.cookie('lastClaimTime', Date.now(), { 
        maxAge: 24 * 60 * 60 * 1000, 
        httpOnly: true
    });
    
    res.json({
        success: true,
        coupon: couponCode,
        message: 'Coupon claimed successfully',
        nextClaimTime: Date.now() + (60 * 60 * 1000) 
    });
});

app.get('/api/check-status', (req, res) => {
    const clientIP = req.ip;
    const canClaim = canClaimCoupon(clientIP);
    const remainingTime = getTimeRemaining(clientIP);
    
    res.json({
        canClaim,
        remainingSeconds: remainingTime
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});