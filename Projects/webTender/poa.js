POA_STRING_JV = '<article > <section id="topRightText"> <p id> Date: <span>DATE</span> </p> <p id> Name of the Contract: <span>FULL_CONTRACT_NAME</span> </p> <p> Invitation for Bid No.: <span>INVITATION_BID_NO</span> </p> <p> Contract Identification No.: <span>CONTRACT_ID_NO</span> </p> </section> <section id="toPart"> <p >To:</p> <span >TO_TEXT </span> </section> <section id="title">Subject: Power of Attorney</section> <section id="mainContent"> <p > Dear Sir, <br> With regards to the above subject I, <span>AP</span>, the Proprietor of this Firm "<span>FIRM_NAME</span>, <span>FIRM_ADDRESS</span>" hereby inform you that as I, myself do all the activities of the firm, I appoint myself as the authorized representative to do all the official and site activities of the project mentioned above. </p> </section> <section id="bottomLeftText"> <span>............</span> <p>(Specimen Signature)</p> <span>AP</span> </section> <section id="bottomRightText"> <span>............</span> <br><span>AP</span> <p>(Propietor)</p> </section> </article>'

getPoa = (formJSON)=> POA_STRING_JV
	 .replaceAll('DATE',formJSON.date)
	 .replaceAll('FULL_CONTRACT_NAME',formJSON.contractName)
	 .replaceAll('INVITATION_BID_NO',formJSON.bidNo)
	 .replaceAll('CONTRACT_ID_NO',formJSON.contractId)
	 .replaceAll('TO_TEXT',formJSON.to)
	 .replaceAll('FIRM_ADDRESS',formJSON.firmAddress)
	 .replaceAll('AP',formJSON.authorized)
	 .replaceAll('FIRM_NAME',formJSON.firmName)
	 .replaceAll('*','<br>')