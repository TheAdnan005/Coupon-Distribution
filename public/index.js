const coupons = [
    "SPRING25OFF", "SUMMER30NOW", "FALL20DEAL", "WINTER15YOU",
    "FLASH50TODAY", "WEEKEND40FUN", "SPECIAL35NOW", "HOLIDAY45JOY"
];

let currentCouponIndex = 0;
const claimedCoupons = new Map(); 

const claimButton = document.getElementById('claimButton');
const couponCard = document.getElementById('couponCard');
const couponCodeElement = document.getElementById('couponCode');
const messageContainer = document.getElementById('messageContainer');

function setCookie(name, value, expiryHours) {
    const date = new Date();
    date.setTime(date.getTime() + (expiryHours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

function showMessage(message, type) {
    messageContainer.textContent = message;
    messageContainer.className = `message ${type}`;
}

function canClaimCoupon() {
    const lastClaimTime = getCookie("lastClaimTime");
    if (lastClaimTime) {
        const timeElapsed = (Date.now() - parseInt(lastClaimTime)) / 1000 / 60 / 60;
        return timeElapsed >= 1;
    }
    return true;
}

function getTimeRemaining() {
    const lastClaimTime = parseInt(getCookie("lastClaimTime"));
    const currentTime = Date.now();
    const elapsedTimeMs = currentTime - lastClaimTime;
    const remainingTimeMs = (60 * 60 * 1000) - elapsedTimeMs;
    
    const minutes = Math.floor((remainingTimeMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingTimeMs % (60 * 1000)) / 1000);
    
    return `${minutes}m ${seconds}s`;
}

function updateCountdown() {
    if (!canClaimCoupon()) {
        showMessage(`You've already claimed a coupon. You can claim another in ${getTimeRemaining()}.`, "info");
        claimButton.disabled = true;
        setTimeout(updateCountdown, 1000);
        if (canClaimCoupon()) {
            showMessage("You can now claim a new coupon!", "info");
            claimButton.disabled = false;
        }
    }
}

function initialize() {
    if (!canClaimCoupon()) {
        updateCountdown();
    }
}

claimButton.addEventListener('click', function() {
    if (!canClaimCoupon()) {
        showMessage(`You need to wait ${getTimeRemaining()} before claiming another coupon.`, "error");
        return;
    }
    
    const couponCode = coupons[currentCouponIndex];
    currentCouponIndex = (currentCouponIndex + 1) % coupons.length;
    
    setCookie("lastClaimTime", Date.now(), 24);
    setCookie("claimedCoupon", couponCode, 24);
    
    couponCodeElement.textContent = couponCode;
    couponCard.style.display = "block";
    
    showMessage("Coupon claimed successfully! You can claim another coupon in 1 hour.", "success");
    claimButton.disabled = true;
    updateCountdown();
    
    console.log("Recording claim with IP and coupon:", couponCode);
});

document.addEventListener('DOMContentLoaded', initialize);