/*

Venmo API parser

var list = [];

temp1.data.forEach(e =>{
	const m = e.message;
	const ms = m.split(/\s+/);
	for(const word of ms){
		if(word.indexOf('@') !== -1){
			list.push(word.toLowerCase())
		}
	}
})

copy(Array.from(new Set(list)))
*/

let emails = [
  "aaaghaja@usc.edu",
  "abaumgar@usc.edu",
  "abdullak@usc.edu",
  "abenmoha@usc.edu",
  "abhambha@usc.edu",
  "abhayakr@usc.edu",
  "abrisach@usc.edu",
  "acritten@usc.edu",
  "ahhyunki@usc.edu",
  "aidenle@usc.edu",
  "ajsmith@usc.edu",
  "akamali@usc.edu",
  "akcora@usc.edu",
  "alexandraashoori@gmail.com",
  "alexcooper0608@gmail.com",
  "allennobel7@gmail.com",
  "allou@usc.edu",
  "amanor@usc.edu",
  "amberzan@usc.com",
  "amdunnin@usc.edu",
  "amenya@usc.edu",
  "amirhega@usc.edu",
  "amyj@usc.edu",
  "andolina@usc.edu",
  "apakrava@usc.edu",
  "apallare@usc.edu",
  "apbarron@usc.edu",
  "aplant@usc.edu",
  "apunch@usc.edu",
  "arami@usc.edu",
  "arenmelk@usc.edu",
  "ariannbl@usc.edu",
  "army-gale22@hotmail.com",
  "asanghai@usc.edu",
  "ashtonas@usc.edu",
  "assraf@usc.edu",
  "atmai@usc.edu",
  "aujk@usc.edu",
  "aureen.agh@gmail.com",
  "axelowit@usc.edu",
  "ayoungda@usc.edu",
  "azangril@usc.edu",
  "baldjiev@usc.edu",
  "baldwinm@usc.edu",
  "baperez@usc.edu",
  "bartecki@usc.edu",
  "bbergh@usc.edu",
  "bdeneaul@usc.edu",
  "belveal@usc.edu",
  "belyaeva@usc.edu",
  "bencohen16@icloud.com",
  "bettys@usc.edu",
  "bgasheri@usc.edu",
  "bglascock@gmail.com",
  "bmasjedi@usc.edu",
  "bmasjedian@gmail.com",
  "bonniew@usc.edu",
  "braidic@usc.edu",
  "brandolt@usc.edu",
  "breitman@usc.edu",
  "brobakow@usc.edu",
  "bryanhsu@usc.edu",
  "bsaeed@usc.edu",
  "bullen@usc.edu",
  "bziemins@usc.edu",
  "caliolli@usc.edu",
  "cansari@usc.edu",
  "capan@usc.edu",
  "carabaja@usc.edu",
  "carolylk@usc.edu",
  "castancj@usc.edu",
  "cbambach@usc.edu",
  "cbaroni@usc.edu",
  "ccrobbin@usc.edu",
  "cdlarsen@usc.edu",
  "cfeuerbo@usc.edu",
  "chan025@usc.edu",
  "chancewe@usc.edu",
  "changbri@usc.edu",
  "chaniota@usc.edu",
  "chansonz@usc.edu",
  "chen337@usc.edu",
  "chenandy@usc.edu",
  "chilaka@usc.edu",
  "chuclaud@usc.edu",
  "ckodama@usc.edu",
  "cktucker@usc.edu",
  "cleytonh@usc.edu",
  "clrowlan@usc.edu",
  "cmukai@usc.edu",
  "conormcc@usc.edu",
  "coomer@usc.edu",
  "courtneymoore1800@yahoo.com",
  "cpbaker775@gmail.com",
  "cpduffy@usc.edu",
  "cpmurray@usc.edu",
  "cpost@usc.edu   for class opening",
  "csheetz@usc.edu",
  "csu@usc.edu",
  "cwslater@usc.edu",
  "cyrena14@sbcglobal.net",
  "daerowon@usc.edu",
  "davidmon@usc.edu",
  "ddole@usc.edu",
  "ddole@uscs.edu",
  "devangss@usc.edu",
  "dgarciac@usc.edu",
  "dhruvilp@usc.edu",
  "disque@usc.edu",
  "dkerner@usc.edu",
  "dlbarret@usc.edu",
  "dmanouki@usc.edu",
  "dmvaughn@usc.edu",
  "dolgonkr@usc.edu",
  "dsivak@usc.edu",
  "dstave@usc.edu",
  "eanthone@usc.edu",
  "eapplewh@usc.edu",
  "eastlack@usc.edu",
  "eberge@usc.edu",
  "eckroate@usc.edu",
  "ecoglito@usc.edu",
  "efitter@usc.edu",
  "eforeman@usc.edu",
  "eglover@usc.edu",
  "egyed@usc.edu",
  "ejfang@usc.edu",
  "elaineh@usc.edu",
  "elamrous@usc.edu",
  "ellahenr@usc.edu",
  "ellakatz@usc.edu",
  "email: rleoni@usc.edu",
  "emonterr@usc.edu",
  "emreynol@usc.edu",
  "epaige@usc.edu",
  "epfiguer@usc.edu",
  "epierrot@usc.edu",
  "erherrer@usc.edu",
  "esimonso@usc.edu",
  "eteo@usc.edu",
  "ethanzim@usc.edu",
  "etwright@usc.edu",
  "evelynka@usc.edu",
  "famccann@usc.edu",
  "fangyufz@usc.edu",
  "fcharlem@usc.edu",
  "fdan@usc.edu",
  "feghali@usc.edu",
  "fharting@usc.edu",
  "filppu@usc.edu",
  "finklea@usc.edu",
  "fiszman@usc.edu",
  "flawley@usc.edu",
  "francescafaugno@yahoo.com",
  "furse@usc.edu",
  "fyue@usc.edu",
  "gabrams@usc.edu",
  "gamcfadd@usc.edu",
  "gameguru1234@gmail.com",
  "gbufalin@usc.edu",
  "gcallagh@usc.edu",
  "gcblanco@usc.edu",
  "gemichae@usc.edu",
  "ghofer@usc.edu",
  "gianatie@usc.edu",
  "gianouso@usc.edu",
  "gjacobson98@gmail.com",
  "gkhammon@usc.edu",
  "glapid@usc.edu",
  "gmatamor@usc.edu",
  "gmelling@usc.edu",
  "goutnova@usc.edu",
  "gracea@usc.edu",
  "gracezha@usc.edu",
  "grava@usc.edu",
  "greerber@usc.edu",
  "gsmcmaho@usc.edu",
  "guraseeb@usc.edu",
  "gutterse@usc.edu",
  "gyailyn@gmail.com",
  "haddan@usc.edu",
  "haozeli@usc.edu",
  "harry.sanders@live.com",
  "hayoungl@usc.edu",
  "hbo@usc.edu",
  "hcheves@usc.edu",
  "hcolumbi@usc.edu",
  "hdsander@usc.edu",
  "hhshah@usc.edu",
  "hkeenan@usc.edu",
  "hlgu@usc.edu",
  "huangandrew21@gmail.com",
  "huich@usc.edu",
  "huskins@usc.edu",
  "hwint@usc.edu",
  "hwint@usc.edu,",
  "hyan6778@usc.edu",
  "hyungsik@usc.edu",
  "iagrawa@usc.edu",
  "iagrawal@usc.edu",
  "ibanta@usc.edu",
  "inasrall@usc.edu",
  "ipenagos@usc.edu",
  "irom@usc.edu",
  "ivaish@usc.edu",
  "jabenite@usc.edu",
  "jack.harris@usc.edu",
  "jackharris@usc.edu",
  "jacksogh@usc.edu",
  "jacobgro@usc.edu",
  "jacobmmi@usc.edu",
  "jadhijaz@usc.edu",
  "jainamkj@usc.edu",
  "jakeob29@icloud.com",
  "jaksland@usc.edu",
  "jamelaad@usc.edu",
  "jaoyagi@usc.edu",
  "jasorian@usc.edu",
  "javiergo@usc.edu",
  "jcalbrig@usc.edu",
  "jcallen@usc.edu",
  "jdaguirr@usc.edu",
  "jennaher@usc.edu",
  "jenniferveronicahewlett@gmail.com",
  "jeremilm@usc.edu",
  "jhburges@usc.edu",
  "jialouwa@usc.edu",
  "jimenez@usc.edu",
  "jintianw@usc.edu",
  "jlukman@usc.edu",
  "jmkaplan@usc.edu",
  "jmweisbe@usc.edu",
  "johnburk@usc.edu",
  "josephfs@usc.edu",
  "joshcha@usc.edu",
  "josuerod@usc.edu",
  "joyceali@usc.edu",
  "joycejan@usc.edu",
  "jrkeatin@usc.edu",
  "jroesler@usc.edu",
  "jsims@usc.edu",
  "jsschirn@aol.com",
  "jtdempse@usc.edu",
  "jtnishid@usc.edu",
  "jtrasmus@usc.edu",
  "juliamda@usc.edu",
  "julianda@usc.edu",
  "juliawad@usc.edu",
  "jutting@usc.edu",
  "jvanderc@usc.edu",
  "jveronic@usc.edu",
  "jwalk@usc.edu",
  "jwhollin@usc.edu",
  "jyvelazq@usc.edu",
  "kabroder@usc.edu",
  "kaileehi@usc.edu",
  "kallahav@usc.edu",
  "kalturki@usc.edu",
  "kaneff@usc.edu",
  "kateadam1011@gmail.com",
  "kcobos@usc.edu",
  "kcting@usc.edu",
  "kctong@usc.edu",
  "kdadbin@usc.edu",
  "kell034@usc.edu",
  "kelleyng@usc.edu",
  "kellyac@usc.edu",
  "kemccorm@usc.edu",
  "khatton@usc.edu",
  "kimhan@usc.edu",
  "kinickx090@outlook.com",
  "kkanter@usc.edu",
  "kkov@usc.edu",
  "kmadkour@usc.edu",
  "kmmccaul@usc.edu",
  "kornguth@usc.edu",
  "koutoumb@usc.edu",
  "kretschm@usc.edu",
  "krfelici@usc.edu",
  "kstarns@usc.edu",
  "ktatters@usc.edu",
  "ktli@usc.edu",
  "ktwong@usc.edu",
  "kucap@usc.edu",
  "kvaldes@usc.edu",
  "kvsurana@usc.edu",
  "lapanoss@usc.edu",
  "lauerjon@usc.edu",
  "laylayun@usc.edu",
  "lbreen@usc.edu",
  "lee619@usc.edu",
  "lee792@usc.edu",
  "lefever@usc.edu",
  "leonhua@usc.edu",
  "lesliehe@usc.edu",
  "lfaltins@usc.edu",
  "lharper@usc.edu",
  "liangmic@usc.edu",
  "lianwang@usc.edu",
  "lingxigu@usc.edu",
  "ljgu@usc.edu",
  "lkrosenb@usc.edu",
  "llent@usc.edu",
  "longhuyn@usc.edu",
  "lope649@usc.edu",
  "louderba@usc.edu",
  "lp_937@usc.edu",
  "lquirke@usc.edu",
  "lsharrin@usc.edu",
  "ltermart@usc.edu",
  "ltse@usc.edu",
  "lucys@usc.edu",
  "lukman.jonathan@yahoo.com",
  "machmali@usc.edu",
  "macrides@usc.edu",
  "madisodg@usc.edu",
  "maeisenb@usc.edu",
  "mariampe@usc.edu",
  "masdon@usc.edu",
  "masdon@usc.edu5",
  "mashabbi@usc.edu",
  "masonest@usc.edu",
  "maxfried@usc.edu",
  "mcende@usc.edu",
  "mch@usc.edu",
  "meizar@usc.edu",
  "mgarfink@usc.edu",
  "mgasper23@gmail.com",
  "miaramos@usc.edu",
  "miggins@usc.edu",
  "minjungs@usc.edu",
  "minkin@usc.edu",
  "mithomps@usc.edu",
  "mjmcguir@usc.edu",
  "mmandell@usc.edu",
  "mmankoff@usc.edu",
  "mmankoff@usc@edu",
  "molko@usc.edu",
  "moracele@usc.edu",
  "morganmi@usc.edu",
  "mulryt@usc.edu",
  "murnen@usc.edu",
  "murquidi@usc.edu",
  "nabadi@usc.edu",
  "nbanniga@usc.edu",
  "nbloch@usc.edu",
  "nchatwan@usc.edu",
  "ncvitani@usc.edu",
  "neconn@usc.edu",
  "neilyang@usc.edu",
  "nickchen@usc.edu",
  "nikoeconn2@gmail.com",
  "nkhalife@usc.edu",
  "nneven@usc.edu",
  "nobel@usc.edu",
  "nohs@usc.edu",
  "noo@usc.edu",
  "norrell@usc.edu",
  "nprideau@usc.edu",
  "nrenna@usc.edu",
  "nsolazzo@usc.edu",
  "ntanga@usc.edu",
  "ntidow988@gmail.com",
  "oamezqui@usc.edu",
  "odooley@usc.edu",
  "oentoro@usc.edu",
  "ogunyank@usc.edu",
  "ohiggs@usc.edu",
  "olkaufma@usc.edu",
  "omccarre@usc.edu",
  "omitecht@gmail.com",
  "oneilb@usc.edu",
  "opereira@usc.edu",
  "orford@usc.edu",
  "oze@usc.edu",
  "pacha@usc.edu",
  "pagecaro@usc.edu",
  "payvandn@usc.edu",
  "pcaron@usc.edu",
  "pdmoreno@usc.edu",
  "pehansen@usc.edu",
  "pickard@usc.edu",
  "piercech@usc.edu",
  "plevy@usc.edu",
  "pmoissis@usc.edu",
  "prikun19@gmail.com",
  "priyakun@usc.edu",
  "pskaf@usc.edu",
  "pulle@usc.edu,",
  "rachelzh@usc.edu",
  "rannamra@usc.edu",
  "rasjotsi@usc.edu",
  "rast@usc.edu",
  "rbowling@usc.edu",
  "rdileo@usc.edu",
  "redingto@usc.edu",
  "reneeye@usc.edu",
  "rgsulliv@usc.edu",
  "rhfang@usc.edu",
  "richardyhz@gmail.com",
  "risaroselynn@gmail.com",
  "ritchie@usc.edu",
  "rlavin@usc.edu",
  "rleoni@usc.edu",
  "rleonram@usc.edu",
  "rmagnus@usc.edu",
  "rmagnus@usc.edu,",
  "rossc@usc.edu",
  "rossmeis@usc.edu",
  "royak@usc.edu",
  "rpsanjay@usc.edu",
  "rrbhatia@usc.edu",
  "rrjung@usc.edu",
  "ruezga@usc.edu",
  "ruizmark@comcast.net",
  "rushawnr@usc.edu",
  "rutama@usc.edu",
  "samantlb@usc.edu",
  "sambloom280@gmail.com",
  "samwachowski98@gmail.com",
  "sarahyao@usc.edu",
  "sarahyao@usc@edu",
  "sawoodar@usc.edu",
  "sbarsott@usc.edu",
  "scheg@usc.edu",
  "schwertl@usc.edu",
  "seherran@usc.edu",
  "serenahe@usc.edu",
  "sesiegel@usc.edu",
  "shayanha@usc.edu",
  "shculver@usc.edu",
  "shepherd@usc.edu",
  "sheridah@usc.edu",
  "siyuwan@usc.edu",
  "sjchoi@usc.edu",
  "skassabi@usc.edu",
  "skedia@usc.edu",
  "skm77634@usc.edu",
  "slgoldma@usc.edu",
  "slhanson@usc.edu",
  "slviscardi@icloud.com",
  "smarell@usc.edu",
  "smcginn@usc.edu",
  "smithcar@usc.edu",
  "snmontan@usc.edu",
  "soltysik@usc.edu",
  "sophiean@usc.edu",
  "sophiean@usc.edu .",
  "ssabih@usc.edu",
  "ssshi@usc.edu",
  "stacey@pixgroup.com",
  "stara@usc.edu",
  "stavish@usc.edu",
  "stead@usc.edu",
  "suehlee@usc.edu",
  "sunyounu@usc.edu",
  "suppiger@usc.edu",
  "szaboa@usc.edu",
  "taeeunka@usc.edu",
  "tangney@usc.edu",
  "tarahsad@usc.edu",
  "tawerbuc@usc.edu",
  "tayl106@usc.edu",
  "taylorwh@usc.edu",
  "terryl@usc.edu",
  "tgapp@usc.edu",
  "tgavin@usc.edu",
  "tgjacobs@usc.edu",
  "therryma@usc.edu",
  "thorii@usc.edu",
  "tkwinter@usc.edu",
  "tpohlman@usc.edu",
  "tramanhvu06@gmail.com",
  "trossell@usc.edu",
  "turtel@usc.edu",
  "tylershooshani@gmail.com",
  "uberstin@usc.edu",
  "udobong@usc.edu",
  "uyennguy@usc.edu",
  "vaanyasg@usc.edu",
  "vatsalgu@usc.edu",
  "viviana@usc.edu",
  "vwestmor@usc.edu",
  "wang851@usc.edu",
  "washingb@usc.edu",
  "wautters@usc.edu",
  "wducharm@usc.edu",
  "weissz@usc.edu",
  "wendelin@usc.edu",
  "wenku@usc.edu",
  "wil454@usc.edu",
  "will454@usc.edu",
  "winnieca@usc.edu",
  "witwer@usc.edu",
  "woltersd@usc.edu",
  "wongjj@usc.edu",
  "xiaochey@usc.edu",
  "xiaoliy@usc.edu",
  "xinyaomi@usc.edu",
  "xyang471@usc.edu",
  "yahansu@usc.edu",
  "yangcynt@usc.edu",
  "ybakhtia@usc.edu",
  "ybhartia@usc.edu",
  "yennapu@usc.edu",
  "yichenhu@usc.edu",
  "yifanfu@usc.edu",
  "yiqinshi@usc.edu",
  "youchenysc@gmail.com",
  "ysmarque@usc.edu",
  "yuandonx@usc.edu",
  "yucather@usc.edu",
  "yufawu@usc.edu",
  "yuhuahu@usc.edu",
  "zaback@usc.edu",
  "zapolski@usc.edu",
  "zeyigu@usc.edu",
  "zhangcry@usc.edu",
  "zhenjial@usc.edu",
  "zixinwu@usc.edu",
  "zorr@usc.edu",
  "zqaderi@usc.edu"
]
for (let i = 0; i < emails.length; i++) {
  emails[i] = emails[i].toLowerCase();
  emails[i] = emails[i].trim();
}

// Not used by SOCAPI, just helper functions for when I'm cleaning up the email list
let dedupe = new Set(emails);
let finalEmailList = Array.from(dedupe);
finalEmailList = finalEmailList.sort();

function emailHasPaid(email) {
  if (!email) {
    return false;
  }
  email = email.toLowerCase();
  email = email.trim();
  return emails.includes(email);
}

module.exports = emailHasPaid;
module.exports.emails = emails;
