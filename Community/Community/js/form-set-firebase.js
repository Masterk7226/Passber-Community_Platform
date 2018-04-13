async function getFormSetByEventId(eventId) {
    var ref = firebase.database().ref("Platform/ABCClub/EventForm");
    var event = await ref.once("value").then(function (data) { // In the Form Level
        var event = data.val();

        return event;
    });
    var form = event[eventId].Form;
    return form;
}

function updateFormSet(eventId, formSet) { // Main function, prestrings to set the true value
    var ref = firebase.database().ref("Platform/ABCClub/EventForm/" + eventId + "/Form");
    ref.set(formSet); //This to set the value and update to database
}