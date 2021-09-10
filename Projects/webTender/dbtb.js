DBTB_STRING_JV = '<article > <section id="topRightText"> <p id> Date: <span>DATE</span> </p> <p id> Name of the Contract: <span>FULL_CONTRACT_NAME</span> </p> <p> Invitation for Bid No.: <span>INVITATION_BID_NO</span> </p> <p> Contract Identification No.: <span>CONTRACT_ID_NO</span> </p> </section> <section id="toPart"> <p >To:</p> <span >TO_TEXT </span> </section> <section id="title">Declaration by the Bidder</section> <section id="mainContent"> <p > We hereby declare that we, <span>FIRM_NAME</span>, <span> FIRM_ADDRESS</span> have gone through and understood the Bidding Document and we have prepared our Bid accordingly with signed and stamped in. We shall sign and stamp each page of contract agreement document in event of award of contract of us. <br> <br>We further confirm that we have indicated price in schedule of Rates considering detailed description of item given in schedule of rates. We confirm that the rates quoted by us in schedule of rates include all activities in each item in relation with the performance the job. <br> <br>Moreover, we declare ourselves that our Firm has never been declared ineligible for the public procurement proceedings and do not have any conflicts of self interest in the proposed procurement proceeding and we have not been punished by an authority in the related profession or business till this date. </p> </section> <section id="bottomRightText"> <span>............</span><br><span>AP</span> <p>(Proprietor)</p> <p>Seal of the Firm</p></section> </article>'

getDd = (formJSON)=> DBTB_STRING_JV
	 .replaceAll('DATE',formJSON.date)
	 .replaceAll('FULL_CONTRACT_NAME',formJSON.contractName)
	 .replaceAll('INVITATION_BID_NO',formJSON.bidNo)
	 .replaceAll('CONTRACT_ID_NO',formJSON.contractId)
	 .replaceAll('TO_TEXT',formJSON.to)
	 .replaceAll('FIRM_ADDRESS',formJSON.firmAddress)
	 .replaceAll('AP',formJSON.authorized)
	 .replaceAll('FIRM_NAME',formJSON.firmName)
	 .replaceAll('*','<br>')