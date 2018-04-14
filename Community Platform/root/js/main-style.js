var $formLogin = $('#login-form');
var $formLost = $('#lost-form');
var $formRegister = $('#register-form');
var $divForms = $('#div-forms');
var $modalAnimateTime = 300;
var $msgAnimateTime = 150;
var $msgShowTime = 2000;

$("form").submit(function () {
    switch (this.id) {
        case "login-form":
            var email = $('#login_email').val();
            var password = $('#login_password').val();

            if (!/\S+@\S+\.\S+/.test(email)) {
                msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "error", "glyphicon-remove", "Invalid Email Address");
            } else {
                LoginAccount(email, password);
            }
            return false;
            break;
        case "lost-form":
            var $ls_email = $('#lost_email').val();
            if ($ls_email == "ERROR") {
                msgChange($('#div-lost-msg'), $('#icon-lost-msg'), $('#text-lost-msg'), "error", "glyphicon-remove", "Send error");
            } else {
                msgChange($('#div-lost-msg'), $('#icon-lost-msg'), $('#text-lost-msg'), "success", "glyphicon-ok", "Send OK");
            }
            return false;
            break;
        case "register-form":
            var email = $('#register_email').val();
            var password = $('#register_password').val();
            var cPassword = $('#register_cPassword').val();
            var fName = $('#register_fName').val();
            var lName = $('#register_lName').val();
            var phone = $('#register_phone').val();
            // if ($rg_username == "ERROR") {
            //     msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Register error");
            // } else {
            //     msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "success", "glyphicon-ok", "Register OK");
            // }
            if (!/\S+@\S+\.\S+/.test(email)) {
                msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Invalid Email Address");
            } else
            if (password != cPassword) {
                msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Confirmation Password does not match");
            } else
            if (!/^[A-z ]+$/.test(fName) | !/^[A-z ]+$/.test(lName)) {
                msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Invalid Name");
            } else if (!/^[0-9]+$/.test(phone)) {
                msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Invalid Phone Number");
            } else {
                $('#register_login_btn').trigger("click");
                firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
                    user.updateProfile({
                        fName: fName,
                        lName: lName,
                        phone: phone
                    });
                }).catch(function (error) {
                    msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Sorry, error during the registration.");
                });
            }
            return false;
            break;
        default:
            return false;
    }
    return false;
});

$('#login_register_btn').click(function () {
    modalAnimate($formLogin, $formRegister)
});
$('#register_login_btn').click(function () {
    modalAnimate($formRegister, $formLogin);
});
$('#login_lost_btn').click(function () {
    modalAnimate($formLogin, $formLost);
});
$('#lost_login_btn').click(function () {
    modalAnimate($formLost, $formLogin);
});
$('#lost_register_btn').click(function () {
    modalAnimate($formLost, $formRegister);
});
$('#register_lost_btn').click(function () {
    modalAnimate($formRegister, $formLost);
});

function modalAnimate($oldForm, $newForm) {
    var $oldH = $oldForm.height();
    var $newH = $newForm.height();
    $divForms.css("height", $oldH);
    $oldForm.fadeToggle($modalAnimateTime, function () {
        $divForms.animate({
            height: $newH
        }, $modalAnimateTime, function () {
            $newForm.fadeToggle($modalAnimateTime);
        });
    });
}

function msgFade($msgId, $msgText) {
    $msgId.fadeOut($msgAnimateTime, function () {
        $(this).text($msgText).fadeIn($msgAnimateTime);
    });
}

function msgChange($divTag, $iconTag, $textTag, $divClass, $iconClass, $msgText) {
    var $msgOld = $divTag.text();
    msgFade($textTag, $msgText);
    $divTag.addClass($divClass);
    $iconTag.removeClass("glyphicon-chevron-right");
    $iconTag.addClass($iconClass + " " + $divClass);
    setTimeout(function () {
        msgFade($textTag, $msgOld);
        $divTag.removeClass($divClass);
        $iconTag.addClass("glyphicon-chevron-right");
        $iconTag.removeClass($iconClass + " " + $divClass);
    }, $msgShowTime);
}
$('#google_login').click(function () {
    LoginWithGoogle.call(this);
});

function onAuthStateChanged() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            alert('Welcome back to Passber!');
            window.location.reload();
        } else {
            msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "error", "glyphicon-remove", "Login failed.");
        }
        console.log(123)
    });
}

$('#sign-out').click(function () {
    var user = firebase.auth().currentUser;
    user.signOut().then(function(){
        window.location.reload();
    });
});

var user = firebase.auth().currentUser;
if (user === null) {
    $('.login-controls').hide();
} else {
    $('#account-management').hide();
}