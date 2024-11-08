sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
],
function (Controller,Fragment,MessageToast) {
    "use strict";

    return Controller.extend("kharcha.category.controller.Category", {
        onInit: function () {

        },
        onCreate:function(){
            const oCategoryModel = new sap.ui.model.json.JSONModel({ "name": "" });
            this.getView().setModel(oCategoryModel, "categoryModel");
            if (!this._oCategoryDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "kharcha.category.view.fragment.CategoryForm",
                    controller: this
                }).then(function (oDialog) {
                    this._oCategoryDialog = oDialog;
                    this.getView().addDependent(this._oCategoryDialog);
                    this._oCategoryDialog.open();
                }.bind(this));
            } else {
                this._oCategoryDialog.open();
            }
        },
        onSaveCategory:function(){
            const sCategoryName = this.getView().getModel('categoryModel').getProperty('/name');

            if (sCategoryName) { 
                this._onSaveBatchCall(sCategoryName) ;
            } else {
                MessageToast.show("Please enter a category name.");
            }
        },
        _onSaveBatchCall: function (categoryName) { 
            const that=this;
            const data = {
                "name": categoryName
            }
            const oModel = this.getOwnerComponent().getModel()

            oModel.create("/Category", data, { 
                success: function (oData, oResponse) { 
                    MessageToast.show('Category Added Successfully');
                    that._oCategoryDialog.close();
                },
                error: function (error) {
                    MessageToast.show(error.message);
                }
            })
        },
       onCancelDialog:function(){
        this._oCategoryDialog.close();
       },
       onDelete:function(oEvent){
        const that=this;
        const selectedRowPath=this.byId('idSimpleTable').getSelectedContextPaths()[0] ;
        var oModel2 = this.getOwnerComponent().getModel() ;
         oModel2.remove(selectedRowPath, {
            method: "DELETE", 
            success: function (oData, oResponse) {
                that.getOwnerComponent().getModel().refresh();
                MessageToast.show('Data Deleted Succesfully');
                BusyIndicator.hide();
            },
            error: function (error) {
                that.getOwnerComponent().getModel().refresh();
                MessageToast.show(JSON.parse(error.responseText).error.message.value);
                BusyIndicator.hide();
            }
        })
    }
});
});

