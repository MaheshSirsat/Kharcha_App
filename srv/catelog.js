const cds = require('@sap/cds');

const { _onBeforePOST,_onBeforeDELETE} = require("./_month");

module.exports=cds.service.impl(srv=>{
    srv.before(['DELETE'],'Category',async (req)=>await _onBeforeDELETE(req,srv))
    srv.before(['CREATE','UPDATE'],'Month',async (req)=>await _onBeforePOST(req,srv))
})