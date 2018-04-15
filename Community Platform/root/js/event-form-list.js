// Form List
// By MAK Kai Chung
var communityID = $.urlParam("communityID");
var eventID = $.urlParam("eventID");
var ref = firebase.database().ref("Community/" + communityID + "/Event/FormSet");
var templates = [];
try {
    templates = JSON.parse(localStorage["form-templates"]);
} catch (error) {
    var jsonObject = [{
        "memberType": "Basic Form",
        "fieldSet": [{
            "type": "first_name",
            "data": {
                label: "First Name",
                "data-type": 1,
                isRequired: true,
                "min-length": 1,
                "max-length": 64,
                regex: '^[A-z\\u4E00-\\u9FFF\\u3400-\\u4DFF\\s ]*$'
            }
        }, {
            "type": "last_name",
            "data": {
                label: "Last Name",
                "data-type": 1,
                isRequired: true,
                "min-length": 1,
                "max-length": 64,
                regex: '^[A-z\\u4E00-\\u9FFF\\u3400-\\u4DFF\\s ]*$'
            }
        }, {
            "type": "email",
            "data": {
                label: "Email",
                "data-type": 0,
                isRequired: true,
                "min-length": 4,
                "max-length": 320,
                regex: '^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$'
            }
        }, {
            "type": "phone_number",
            "data": {
                label: "Phone Number",
                "data-type": 2,
                isRequired: true,
                "min-length": 8,
                "max-length": 17,
                regex: '^[0-9]*$'
            }
        }],
        "isActivated": false
    }];

    localStorage["form-templates"] = JSON.stringify(jsonObject);
    templates = JSON.parse(localStorage["form-templates"]);
}

var forms = [];
try {
    //try {
    //    forms = getFormSetByEventId(eventId);
    //    if (forms === undefined) {
    //        forms = [];
    //    }
    //} catch (error) {

    //}
    ref.once("value").then(function (data) {
        if (data.val() != null) {
            forms = data.val();
        }

        for (var i = 0; i < forms.length; i++) {
            var memberType = forms[i].memberType;
            var fieldSet = forms[i].fieldSet;
            var isActivated = forms[i].isActivated;
            var form = new FormList.Form(memberType, fieldSet, isActivated);

            FormList.addFormItem(form);
        }
    });
} catch (error) {
    var jsonObject = [];

    localStorage["forms"] = JSON.stringify(jsonObject);
    forms = JSON.parse(localStorage["forms"]);
}


var FormList = function () {
    this.formList = $("#form-list");
    this.addFormButton = $("#add-form");
    this.templateSet = [];
    this.formSet = [];

    this.addFormButton.on("click.enter-editor", {
        template: this
    }, function (event) {
        var infoForm = $('<div class="info-create-form">');
        var memberTypeField = $('<input type="text" class="memberType">');

        infoForm.append('<h4>Form Name</h4>');
        infoForm.append('<p>Give your form a name?</p>');
        infoForm.append(memberTypeField);
        infoForm.attr({
            "data-form-id": this.id
        });
        infoForm.dialog({
            modal: true,
            buttons: {
                "Create Form": function () {
                    var infoForm = $(this).closest(".ui-dialog").find(".info-create-form");
                    var memberTypeField = infoForm.find(".memberType");
                    var memberType = memberTypeField.val();
                    var form = new FormList.Form(memberType, []);
                    FormList.addForm(form);
                    var formID = form.getId();

                    FormList.directToEditor(formID);
                },
                Cancel: function () {
                    $(this).dialog("destroy");
                }
            },
            close: function () {

            }
        });
    });

    // Form Item
    this.Form = function (memberType, fieldSet, isActivated) {
        this.type = "form";
        this.memberType = memberType;
        this.fieldSet = fieldSet;
        this.isActivated = isActivated;
    };
    this.Form.prototype.getMemberType = function () {
        return this.memberType;
    };
    this.Form.prototype.getFieldSet = function () {
        return this.fieldSet;
    };
    this.Form.prototype.getId = function () {
        return this.id;
    };
    this.Form.prototype.setType = function (type) {
        this.type = type;
    };
    this.Form.prototype.setId = function (id) {
        this.id = id;
    };
    this.Form.prototype.setDOM = function (dom) {
        this.dom = dom;
    };
    this.Form.prototype.toDisplayDOM = function () {
        var formItem = $('<div class="form-item">');

        formItem.attr({
            "data-form-id": this.id
        });

        var formLabel = $('<label>');

        formLabel.text(this.memberType);
        formItem.append(formLabel);
        formItem.on("click.enter-editor", function () {
            var id = $(this).attr("data-id");
            var form = FormList.getFormById(id);

            form.doClick();
        });

        return formItem;
    };
    this.Form.prototype.doClick = function () {
        FormList.directToEditor(this.id);
    }

    // Template Items
    this.Template = function (memberType, fieldSet) {
        FormList.Form.call(this, memberType, fieldSet);
        this.setType("template");
    }
    this.Template.prototype = Object.create(this.Form.prototype);
    this.Template.constructor = this.Template;
    this.Template.prototype.toDisplayDOM = function () {
        var formItem = Object.getPrototypeOf(FormList.Template.prototype).toDisplayDOM.call(this);

        console.log(123)
        formItem.addClass("template");
        formItem.off("click.enter-editor");
        formItem.on("click.enter-editor", {
            template: this
        }, function (event) {
            var template = event.data.template;

            template.doClick();
        });

        return formItem;
    };
    this.Template.prototype.doClick = function () {
        var infoForm = $('<div class="info-create-form">');
        var memberTypeField = $('<input type="text" class="memberType">');

        infoForm.append('<h4>Form Name</h4>');
        infoForm.append('<p>Give your form a name?</p>');
        infoForm.append(memberTypeField);
        infoForm.attr({
            "data-form-id": this.id
        });
        infoForm.dialog({
            modal: true,
            buttons: {
                "Create Form": function () {
                    var infoForm = $(this).closest(".ui-dialog").find(".info-create-form");
                    var memberTypeField = infoForm.find(".memberType");
                    var memberType = memberTypeField.val();
                    var id = infoForm.attr("data-form-id");
                    var templateObject = FormList.getTemplateById(id);
                    var form = new FormList.Form(memberType, templateObject.fieldSet);
                    FormList.addForm(form);
                    var formID = form.getId();

                    FormList.directToEditor(formID);
                },
                Cancel: function () {
                    $(this).dialog("destroy");
                }
            },
            close: function () {

            }
        });
    }

    // // Empty Form
    // this.EmptyForm = function () {
    //     FormList.Template.call(this, "Empty Form", []);
    // }
    // this.EmptyForm.prototype = Object.create(this.Template.prototype);
    // this.EmptyForm.constructor = this.EmptyForm;
    // this.EmptyForm = new this.EmptyForm()
};
FormList.prototype.addForm = function (form) {
    var memberType = form.getMemberType();
    var fieldSet = form.getFieldSet();
    var index = forms.length;

    var jsonObject = {
        memberType: memberType,
        fieldSet: fieldSet
    };

    forms[index] = jsonObject;
    //updateFormSet(eventId, forms);
    // localStorage["forms"] = JSON.stringify(forms);
    ref.set(forms);

    this.addFormItem(form);

    return index;
};
FormList.prototype.getFormById = function (id) {
    return this.formSet[id];
}
FormList.prototype.getTemplateById = function (id) {
    return this.templateSet[id];
}
FormList.prototype.addTemplate = function (template) {
    var id = this.templateSet.length;
    var dom = template.toDisplayDOM();

    dom.attr({
        "data-form-id": id,
        "data-id": id
    });

    template.setDOM(dom);
    template.setId(id);
    this.templateSet[id] = template;
    FormList.formList.prepend(dom);
}
FormList.prototype.addFormItem = function (form) {
    var id = this.formSet.length;
    var dom = form.toDisplayDOM();

    dom.attr({
        "data-form-id": id,
        "data-id": id
    });
    console.log(form.isActivated, dom)
    if(form.isActivated){
        dom.addClass("activated");
    }
    
    form.setDOM(dom);
    form.setId(id);
    this.formSet[id] = form;
    FormList.addFormButton.before(dom);
}
FormList.prototype.directToEditor = function (formID) {
    window.location.href = "event-dynamic-form.html?communityID=" + communityID + "&form-id=" + formID;
};
var FormList = new FormList();

for (var i = 0; i < templates.length; i++) {
    var memberType = templates[i].memberType;
    var fieldSet = templates[i].fieldSet;
    var template = new FormList.Template(memberType, fieldSet);

    FormList.addTemplate(template);
}

// for (var i = 0; i < forms.length; i++) {
//     var memberType = forms[i].memberType;
//     var fieldSet = forms[i].fieldSet;
//     var form = new FormList.Form(memberType, fieldSet);

//     FormList.addFormItem(form);
// }