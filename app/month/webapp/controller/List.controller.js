sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
],
    function (Controller, Fragment, MessageToast) {
        "use strict";

        return Controller.extend("kharcha.month.controller.List", {
            onInit: function () {
                const appInfoModel = new sap.ui.model.json.JSONModel({
                    "rowSelected": false
                });
                this.getView().setModel(appInfoModel, "appInfo");
            },
            onSelectionChange: function (oEvent) {
                if (oEvent.getSource().getSelectedItem) {
                    this.getView().getModel('appInfo').setProperty('/rowSelected', true)
                } else {
                    this.getView().getModel('appInfo').setProperty('/rowSelected', false)

                }
            },
            onCreate: function (oEvent) {
                const omonthModel = new sap.ui.model.json.JSONModel({ "ID": null, "month_name": "", "year": "", "previous_Balance": "", "credit_Balance": "" });
                this.getView().setModel(omonthModel, "monthModel");
                if (!this._oMonthDialog) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "kharcha.month.view.fragment.MonthForm",
                        controller: this
                    }).then(function (oDialog) {
                        this._oMonthDialog = oDialog;
                        this.getView().addDependent(this._oMonthDialog);
                        this._oMonthDialog.open();
                    }.bind(this));
                } else {
                    this._oMonthDialog.open();
                }
            },
            onUpdate(oEvent) {
                const oSelectedData = this.byId('idSimpleTable').getSelectedContexts()[0]?.getObject();
                const omonthModel = new sap.ui.model.json.JSONModel(oSelectedData);
                if (oSelectedData) {

                    this.getView().setModel(omonthModel, "monthModel");
                    if (!this._oMonthDialog) {
                        Fragment.load({
                            id: this.getView().getId(),
                            name: "kharcha.month.view.fragment.MonthForm",
                            controller: this
                        }).then(function (oDialog) {
                            this._oMonthDialog = oDialog;
                            this.getView().addDependent(this._oMonthDialog);
                            this._oMonthDialog.open();
                        }.bind(this));
                    } else {
                        this._oMonthDialog.open();
                    }
                } else {
                    MessageToast.show('Please select row')
                }

            },
            onSaveCategory: function () {
                const oMonthData = this.getView().getModel('monthModel').getData();

                if (oMonthData?.createdAt) {
                    this._onUpdateBatchCall(oMonthData)
                } else {
                    this._onSaveBatchCall(oMonthData)
                }
            },
            _onSaveBatchCall: function (oMonthData) {
                const that = this;
                const oModel = this.getOwnerComponent().getModel()
                const oPayload = {
                    "month_name": oMonthData.month_name,
                    "year": oMonthData.year,
                    "previous_Balance": +oMonthData.previous_Balance,
                    "credit_Balance": +oMonthData.credit_Balance
                }
                oModel.create("/Month", oPayload, {
                    success: function (oData, oResponse) {
                        MessageToast.show('Month Added Successfully');
                        that._oMonthDialog.close();
                        that.getOwnerComponent().getModel().refresh();
                    },
                    error: function (error) {
                        MessageToast.show(error.message)
                        that.getOwnerComponent().getModel().refresh();

                    }
                })
            },
            _onUpdateBatchCall: function (oMonthData) {
                const that = this;
                const rowData = this.getView().getModel('monthModel').getData();
                const path = this.byId('idSimpleTable').getSelectedContextPaths()[0];

                const data = {
                    "month_name": rowData.month_name,
                    "year": rowData.year,
                    "previous_Balance": +rowData.previous_Balance,
                    "credit_Balance": +rowData.credit_Balance

                }
                var oModel = this.getOwnerComponent().getModel() 
                oModel.update(path, data, {
                    method: "PUT",
                    success: function (oData, oResponse) {
                        MessageToast.show('Data Updates Succesfully')
                        that._oMonthDialog.close();
                        that.getOwnerComponent().getModel().refresh();
                    },
                    error: function (error) {
                        MessageToast.show(error.message)
                        that.getOwnerComponent().getModel().refresh();
                    }
                })
            },
            onDelete:function(oEvent){
                const that=this;
                const selectedRowPath=this.byId('idSimpleTable').getSelectedContextPaths()[0] ;
                var oModel = this.getOwnerComponent().getModel() ;
                 oModel.remove(selectedRowPath, {
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
            },
            onCancelDialog:function(){
                this._oMonthDialog.close();
            },
            onMonthNameLinkPress(oEvent){
                const rowData=oEvent.getSource().getBindingContext().getObject();
                sap.ui.core.UIComponent.getRouterFor(this).navTo("MonthView" ,{
                    month_name: rowData.month_name,
                    year: rowData.year
                }); 
            }
        });
    });
