const sourceText = document.querySelector("#sourceText");
const convertBtn = document.querySelector("#convertBtn");
const autoConvert = document.querySelector("#autoConvert");
const keepLists = document.querySelector("#keepLists");
const keepTables = document.querySelector("#keepTables");
const dropZone = document.querySelector("#dropZone");
const outputs = {
  topic: document.querySelector("#topicOutput"),
  compact: document.querySelector("#compactOutput"),
  mobile: document.querySelector("#mobileOutput"),
  pc: document.querySelector("#pcOutput"),
  pcMb6r: document.querySelector("#pcMb6rOutput"),
  pcMb3b: document.querySelector("#pcMb3bOutput"),
};
const keyTabs = document.querySelector("#keyTabs");
const copyKeyBtn = document.querySelector("#copyKeyBtn");
const copyTopicKeyBtn = document.querySelector("#copyTopicKeyBtn");
const guideBtn = document.querySelector("#guideBtn");
const guideModal = document.querySelector("#guideModal");
const guideCloseBtn = document.querySelector("#guideCloseBtn");
const imageButtonsBtn = document.querySelector("#imageButtonsBtn");
const imageButtonsModal = document.querySelector("#imageButtonsModal");
const imageButtonsCloseBtn = document.querySelector("#imageButtonsCloseBtn");
const imageScopeTabs = document.querySelector("#imageScopeTabs");
const sharedImageButtonsStatus = document.querySelector("#sharedImageButtonsStatus");
const reloadSharedImageButtonsBtn = document.querySelector("#reloadSharedImageButtonsBtn");
const sharedImageButtonsToken = document.querySelector("#sharedImageButtonsToken");
const saveSharedImageButtonsBtn = document.querySelector("#saveSharedImageButtonsBtn");
const imageButtonRowsBody = document.querySelector("#imageButtonRows");
const addImageButtonRowBtn = document.querySelector("#addImageButtonRowBtn");
const saveImageButtonsBtn = document.querySelector("#saveImageButtonsBtn");
const resetImageButtonsBtn = document.querySelector("#resetImageButtonsBtn");
const preview = document.querySelector("#preview");
const authGate = document.querySelector("#authGate");
const appShell = document.querySelector("#appShell");
const authForm = document.querySelector("#authForm");
const authPassword = document.querySelector("#authPassword");
const authError = document.querySelector("#authError");
let parsedNotifications = [];
let activeNotificationIndex = 0;
let activeImageButtonScope = "pc";
const accessPassword = "0558";
const accessSessionKey = "locform-auth-ok";
const imageButtonsStorageKey = "locform-redesign-image-buttons-v2";
const sharedImageButtonsUrl = "https://locform-images.nzs2593.workers.dev/image-buttons";
const bundledSharedImageButtonsUrl = "image-buttons.shared.json";
const sharedImageButtonsTokenKey = "locform-image-buttons-password";
let sharedImageButtonsAutosaveTimer = 0;

const defaultImageButtonRows = [
  ["mb6r", "RUS", "\u0417\u0430 \u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043a\u043e\u0439", "https://image-gallery-s3-stable.mindbox.ru/55B9273DBBF8576B47E312DCC97832B32040004CCB763326D19CDC18F8FF3123.png", "https://image-gallery-s3-stable.mindbox.ru/9AF17BC503BAE0DEC955A13C3686925C1A920BA22F3D45F4F8D2488BA3198B6D.png"],
  ["mb6r", "RUS", "\u0417\u0430 \u0444\u0440\u0438\u0431\u0435\u0442\u043e\u043c", "https://image-gallery-s3-stable.mindbox.ru/57E0CA10B3DA23DC10665D556A1815BFCAF78D674499F8AC8F1FA1D2F3A6BCED.png", "https://image-gallery-s3-stable.mindbox.ru/F27858984E73AC90311B07E4B51EE7805F90D34C216C7CAE0BEECBC9EDAB5726.png"],
  ["mb6r", "RUS", "\u041f\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u0441\u0447\u0451\u0442", "https://image-gallery-s3-stable.mindbox.ru/10D97D0D0632417294939F7A7DE032CEB4083997C4B61A1218FAB717DE20CF2A.png", "https://image-gallery-s3-stable.mindbox.ru/4634C2BDABFF7B46BFFE508424615BBA250FFC7DDADECA559D2D053681D48DEB.png"],
  ["mb6r", "RUS", "\u0412\u043d\u0435\u0441\u0442\u0438 \u0434\u0435\u043f\u043e\u0437\u0438\u0442", "https://image-gallery-s3-stable.mindbox.ru/111846CFD90AE938CABD312C93AB092B85689705B88D33AB8D596F822D8CE226.png", "https://image-gallery-s3-stable.mindbox.ru/35C0F1BED421F6E8D1F112347E4D850BC6C7C5311EF2D272274FA6C8158F4AF9.png"],
  ["mb6r", "RUS", "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435", "https://image-gallery-s3-stable.mindbox.ru/E2CF9C4E2F2038A9BEBCC9B762EE18CE8CE331BC27029F3159FD1B0D92B67C1D.png", "https://image-gallery-s3-stable.mindbox.ru/0138530488066ED2C4EDF1167A27DE85DC2A8C7E3FF7AD3B6AB6150DB5087055.png"],
  ["mb6r", "RUS", "\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0431\u043e\u043d\u0443\u0441", "https://image-gallery-s3-stable.mindbox.ru/4972439F76F699D8B694B591F78AAE4284D265872EE0A8721003387453B27025.png", "https://image-gallery-s3-stable.mindbox.ru/4C1E91BC8F73CEEDBA1C000DD14249754E0668F374924C68B9F4C1509292FC67.png"],
  ["mb6r", "RUS", "\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043b\u0438\u043d\u0438\u044e", "https://image-gallery-s3-stable.mindbox.ru/D64A01AEB1EB5F735FC6C57B030A7C8745C9B15128A5EF7026ADC6CC6632C9BE.png", "https://image-gallery-s3-stable.mindbox.ru/4DD66EC61955D27F5840332E6D08DC6F045C5CF1B0DC5F8DAA38174C54A7E652.png"],
  ["mb3b", "RUS", "\u0417\u0430 \u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043a\u043e\u0439", "https://image-gallery-s3-stable.mindbox.ru/55B9273DBBF8576B47E312DCC97832B32040004CCB763326D19CDC18F8FF3123.png", "https://image-gallery-s3-stable.mindbox.ru/9AF17BC503BAE0DEC955A13C3686925C1A920BA22F3D45F4F8D2488BA3198B6D.png"],
  ["mb3b", "RUS", "\u0417\u0430 \u0444\u0440\u0438\u0431\u0435\u0442\u043e\u043c", "https://image-gallery-s3-stable.mindbox.ru/57E0CA10B3DA23DC10665D556A1815BFCAF78D674499F8AC8F1FA1D2F3A6BCED.png", "https://image-gallery-s3-stable.mindbox.ru/F27858984E73AC90311B07E4B51EE7805F90D34C216C7CAE0BEECBC9EDAB5726.png"],
  ["mb3b", "RUS", "\u041f\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u0441\u0447\u0451\u0442", "https://image-gallery-s3-stable.mindbox.ru/10D97D0D0632417294939F7A7DE032CEB4083997C4B61A1218FAB717DE20CF2A.png", "https://image-gallery-s3-stable.mindbox.ru/4634C2BDABFF7B46BFFE508424615BBA250FFC7DDADECA559D2D053681D48DEB.png"],
  ["mb3b", "RUS", "\u0412\u043d\u0435\u0441\u0442\u0438 \u0434\u0435\u043f\u043e\u0437\u0438\u0442", "https://image-gallery-s3-stable.mindbox.ru/111846CFD90AE938CABD312C93AB092B85689705B88D33AB8D596F822D8CE226.png", "https://image-gallery-s3-stable.mindbox.ru/35C0F1BED421F6E8D1F112347E4D850BC6C7C5311EF2D272274FA6C8158F4AF9.png"],
  ["mb3b", "RUS", "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435", "https://image-gallery-s3-stable.mindbox.ru/E2CF9C4E2F2038A9BEBCC9B762EE18CE8CE331BC27029F3159FD1B0D92B67C1D.png", "https://image-gallery-s3-stable.mindbox.ru/0138530488066ED2C4EDF1167A27DE85DC2A8C7E3FF7AD3B6AB6150DB5087055.png"],
  ["mb3b", "RUS", "\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0431\u043e\u043d\u0443\u0441", "https://image-gallery-s3-stable.mindbox.ru/4972439F76F699D8B694B591F78AAE4284D265872EE0A8721003387453B27025.png", "https://image-gallery-s3-stable.mindbox.ru/4C1E91BC8F73CEEDBA1C000DD14249754E0668F374924C68B9F4C1509292FC67.png"],
  ["mb3b", "RUS", "\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043b\u0438\u043d\u0438\u044e", "https://image-gallery-s3-stable.mindbox.ru/D64A01AEB1EB5F735FC6C57B030A7C8745C9B15128A5EF7026ADC6CC6632C9BE.png", "https://image-gallery-s3-stable.mindbox.ru/4DD66EC61955D27F5840332E6D08DC6F045C5CF1B0DC5F8DAA38174C54A7E652.png"],
  ["pc", "RUS", "\u0417\u0430 \u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043a\u043e\u0439", "https://image-gallery-s3-stable.mindbox.ru/96B45BE69D153C90F1F8111CCD93AD10E2EC008D7654560F794DB4B339863057.png", "https://image-gallery-s3-stable.mindbox.ru/9834C794C2E5E8BDEF201B4DF4B5EF07F518D72ADE7F0CDDE12ED8F9DC2DDADD.png"],
  ["pc", "RUS", "\u0417\u0430 \u0444\u0440\u0438\u0431\u0435\u0442\u043e\u043c", "https://image-gallery-s3-stable.mindbox.ru/F0DB590F99A575A0DEA04F2CC3E6115431B948930FCAC131A3329902DBEECEC9.png", "https://image-gallery-s3-stable.mindbox.ru/455C1C1AB9AAA493B3919EFC1222EE6CA4BD672C3D98962E0DC289D5EC88A69A.png"],
  ["pc", "RUS", "\u041f\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u0441\u0447\u0451\u0442", "https://image-gallery-s3-stable.mindbox.ru/78AA24567715B43DF344658FE6C8D9BAFB411143A326B20A8EF787FCF4FF7EC7.png", "https://image-gallery-s3-stable.mindbox.ru/D775FC3727517295FFC4E2601E2045B453DA02BA07679F9A1770006DEA3A168C.png"],
  ["pc", "RUS", "\u0412\u043d\u0435\u0441\u0442\u0438 \u0434\u0435\u043f\u043e\u0437\u0438\u0442", "https://image-gallery-s3-stable.mindbox.ru/F3D7656DC4D33E4DB51D96BD72260E6FA4857B15D0DCBEA615EA56753A482B84.png", "https://image-gallery-s3-stable.mindbox.ru/7D907A1A00F1051256A16DB7C58D3445563C12C9C6A958595CC2E4D36CF5797A.png"],
  ["pc", "RUS", "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435", "https://image-gallery-s3-stable.mindbox.ru/751C54ED4D7ABA5A1E33F23220584EE70B6CCCD3294DD200C4819F1B5797E6FB.png", "https://image-gallery-s3-stable.mindbox.ru/C5E60D0EA93987129C85A8C86452DD1389745A2A3763DEC746496B5B51201F45.png"],
  ["pc", "RUS", "\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0431\u043e\u043d\u0443\u0441", "https://image-gallery-s3-stable.mindbox.ru/621868E7732A68406F11F2AC6F040862F8F22939E6B949B4B0BD444E10D3C06C.png", "https://image-gallery-s3-stable.mindbox.ru/0EB40FC244E1A4216629759A046F0E40AB968AA03BEDA6ABF255B45958E7140E.png"],
  ["pc", "RUS", "\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043b\u0438\u043d\u0438\u044e", "https://image-gallery-s3-stable.mindbox.ru/D64A01AEB1EB5F735FC6C57B030A7C8745C9B15128A5EF7026ADC6CC6632C9BE.png", "https://image-gallery-s3-stable.mindbox.ru/4DD66EC61955D27F5840332E6D08DC6F045C5CF1B0DC5F8DAA38174C54A7E652.png"],
  ["pc", "ENG", "Insure Your Bet", "https://image-gallery-s3-stable.mindbox.ru/8DADCAD6107CEA55C3280ED596B76D5FC70970C28BAFEFB779DC957536BF99D4.png", "https://image-gallery-s3-stable.mindbox.ru/18640474A885D690BEE24CC6A6E532DF4A398588EBC9D5A0CD10EAC18C025361.png"],
  ["pc", "ENG", "Claim Free Bet", "https://image-gallery-s3-stable.mindbox.ru/39ACEC6751602FA8D4C542E0E3E995210F7380B4A979DDFDBF1A9614E0594470.png", "https://image-gallery-s3-stable.mindbox.ru/266B62B2E8AD70D554C076FAEAFA82E7E93316D090F5D9EB71B019CD34FC5171.png"],
  ["pc", "ENG", "Make A Deposit", "https://image-gallery-s3-stable.mindbox.ru/CB4731BADED5394A58F8761FCE9E1B3C28D78CF5CB2A5E8200B34E7884748268.png", "https://image-gallery-s3-stable.mindbox.ru/DF47B5F81E268DD98A343358B24D88C147C226AD7FBB2D2081150156EBF85943.png"],
  ["pc", "ENG", "Deposit", "https://image-gallery-s3-stable.mindbox.ru/EEAEEB3F54C1CBD0730BA03D4FAD3E467D8FC076DC34D3A39A42B3C431FE1E84.png", "https://image-gallery-s3-stable.mindbox.ru/E98280C95F76F180BBB25CEA8F76DD41A35D6829E99880DFC66A26128E52F8CB.png"],
  ["pc", "ENG", "More Info", "https://image-gallery-s3-stable.mindbox.ru/70BD33D78A891F38A133E203A34896FB7B5B9AF673EAD49101AACF7754D3BE7E.png", "https://image-gallery-s3-stable.mindbox.ru/1CDE47BC46AE06DCA5B2929C487898C507A76A0A8F79F7608572A0DCBADD1C0E.png"],
  ["pc", "ENG", "Go To Sportsbook", "https://image-gallery-s3-stable.mindbox.ru/B27E01F65C8B6E3076672BF6473D12CEF8EEB9F5ADD7BC2B39385007D533B10F.png", "https://image-gallery-s3-stable.mindbox.ru/75728485861E4F71963A04A30E479CFFC74620612363B30BEFE85596354D21B4.png"],
  ["pc", "ENG", "Claim Bonus", "https://image-gallery-s3-stable.mindbox.ru/50F5AC5AB9827EF1D90C0503EBE94D534AB04488A5050E56F7DE5349C242FC6F.png", "https://image-gallery-s3-stable.mindbox.ru/DF098FFE69D6F7EF0F67D499760DF5F9FEFF0C2806C741904FC23D542DA16FFF.png"],
  ["pc", "UZB", "Stavkani sug'urtalash", "https://image-gallery-s3-stable.mindbox.ru/893A7D1DAE010E4A46BE6C9D37AEADD61FE86D007600F2E18CDC82B4FA25B2DD.png", "https://image-gallery-s3-stable.mindbox.ru/112033FEA94827EAC376D836AD00FF52E49626A5FA0AA44A15A5D43AFE0B3400.png"],
  ["pc", "UZB", "Fribetni olish", "https://image-gallery-s3-stable.mindbox.ru/23E9BF2477FAC22CD7627CED3A8DF81B7D8F468E3120F38724AF76F43E95C0F1.png", "https://image-gallery-s3-stable.mindbox.ru/713F90E3334FF6AAF2709E2847BC9E78EF7B132422F1029005B115E884A9A174.png"],
  ["pc", "UZB", "Depozit qo'yish", "https://image-gallery-s3-stable.mindbox.ru/FCDE01A4FFDEDD1AAB01A6C4EDCF21DFAA401D444FFB33B940D7B5E63E29BD25.png", "https://image-gallery-s3-stable.mindbox.ru/AB5FA5B68F50262DBC65D3C437585768CC2127D140FB55E51BC7734896B3FD3E.png"],
  ["pc", "UZB", "Depositar", "https://image-gallery-s3-stable.mindbox.ru/BF1726BA25636A3C3AB0D8948446362D698CBA6D18A926C0FD32A542A699733A.png", "https://image-gallery-s3-stable.mindbox.ru/16AD6F37A4B332DD0F7E65A823B947DDDD133B5A3BCD1C98B5D25CAC3A83E58F.png"],
  ["pc", "UZB", "Batafsil", "https://image-gallery-s3-stable.mindbox.ru/B7E680822BA4ECC897B7F704AB164E6EFD856A07F4309370C87FCD71228B037D.png", "https://image-gallery-s3-stable.mindbox.ru/4670AE6D3C60A8DB335241B3CECA9DDED115FDC7775D406FCA14447E55DAE09C.png"],
  ["pc", "ES_LATAM", "Apuesta segura", "https://image-gallery-s3-stable.mindbox.ru/523C722B8BD1A85CE555C02F4C8E63C997A05879AE6864AFA8D71B450092494C.png", "https://image-gallery-s3-stable.mindbox.ru/A13E8E0CA39D89925482E840868C193CEDC25F1189816CFB4DE7F7C11210FE4B.png"],
  ["pc", "ES_LATAM", "Apuesta Gratis", "https://image-gallery-s3-stable.mindbox.ru/87218C661AC3EBF682BA297D1242AAC96F77035CB70765E6CAF7B513B4AAF624.png", "https://image-gallery-s3-stable.mindbox.ru/84D27FF443F73F2395F228D12D4941A0D09B41C3D638B85E6D5FC121032509D9.png"],
  ["pc", "ES_LATAM", "Hacer un dep\u00f3sito", "https://image-gallery-s3-stable.mindbox.ru/DEC9938F890768F622453BD7EBA9C92F3549173B0259BDC9EC4C4F422001F6D1.png", "https://image-gallery-s3-stable.mindbox.ru/F161AFC79CE488D308A0C5295C53B6CD11D29681E2C9FD19CE258F13741C57AE.png"],
  ["pc", "ES_LATAM", "M\u00e1s informaci\u00f3n", "https://image-gallery-s3-stable.mindbox.ru/4EEBAF54C71CC1DF4C3E973592F601AE61CF7AE06962F4030264026B62A81833.png", "https://image-gallery-s3-stable.mindbox.ru/30EFF5A5B7277AB2B04BF93960C59C7DCBE71E600DA89A848C206CDAB1A43C06.png"],
  ["pc", "AZ", "M\u0259rcl\u0259rinizi s\u0131\u011fortalay\u0131n", "https://image-gallery-s3-stable.mindbox.ru/556B66E145E44C44288F012E9AF7A2470576AE11F2F7ABA10DAF33145EBB4320.png", "https://image-gallery-s3-stable.mindbox.ru/CE042A868C647D98A662B41D18C4635C496B2CD7E0426BDF7FA1DB1BAF1E1735.png"],
  ["pc", "AZ", "Fribet \u0259ld\u0259 edin", "https://image-gallery-s3-stable.mindbox.ru/1C2926C2FAD6FE590517014E34A31ABEFE1E3E9F4DD257D45CD16D72060FEB6B.png", "https://image-gallery-s3-stable.mindbox.ru/9CE153D7CA58BFABD2A47EBF2B7E928C012F24A6A7405DD034B91C9A68902B9B.png"],
  ["pc", "AZ", "Depozit qoyun", "https://image-gallery-s3-stable.mindbox.ru/B0A0CD66FCD3BB64B11EE5F7D90EF0CDDF76BD7F25D2FBBF8983E354843F69BC.png", "https://image-gallery-s3-stable.mindbox.ru/714BB874421E26515ED490C1175310075970BDCD7DE608BACA66ECD3F4BDFB99.png"],
  ["pc", "AZ", "\u018ftrafl\u0131 m\u0259lumat", "https://image-gallery-s3-stable.mindbox.ru/46ADAAA03ECF147E7D96193554B70B22601480406509ADF3E0D900359A92DF9D.png", "https://image-gallery-s3-stable.mindbox.ru/642E5CA04D3378994C08D9B50762BD52E1FF4D63C07243501A8EBBC6252F7253.png"],
].map(([scope, language, text, green, white]) => ({ scope, language, text, green, white, width: 319, height: 40 }));
let imageButtonRows = loadImageButtonRows();

const stableNames = [
  "Drops & Wins",
  "Pragmatic Play",
  "Gates of Olympus 1000",
  "Wisdom of Athena 1000",
  "Big Bass Bonanza 1000",
  "Giros Gratis",
  "Ruedas de Premios Semanales",
];
let dynamicStableNames = [];

const nbspMarkerRe = /\u043d\u0435\u0440\u0430\u0437\u0440\u044b\u0432\u043d\u044b\u0435\s+\u043f\u0440\u043e\u0431\u0435\u043b\u044b/iu;

function refreshDynamicStableNames(text) {
  const seen = new Set(stableNames.map((name) => name.toLowerCase()));
  const names = [];

  String(text || "").split("\n").forEach((line) => {
    const plain = stripTags(line).replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (!nbspMarkerRe.test(plain)) return;

    const [, rest = ""] = plain.split(/:(.*)/s);
    rest.split(",").forEach((part) => {
      const name = part.replace(/\s+/g, " ").trim();
      if (name.length < 2 || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      names.push(name);
    });
  });

  dynamicStableNames = names;
}

function escapeHtml(value) {
  return value
    .replace(/&(?!(?:nbsp|amp|lt|gt|quot|#39);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(String(value || "")).replace(/"/g, "&quot;");
}

function restoreAllowedTags(value) {
  return value
    .replace(/&lt;(\/?)b&gt;/g, "<$1b>")
    .replace(/&lt;(\/?)i&gt;/g, "<$1i>")
    .replace(/&lt;(\/?)u&gt;/g, "<$1u>")
    .replace(/&lt;a href="([^"]+)" target="_blank"&gt;/g, (_, href) => `<a href="${href.replace(/&amp;/g, "&")}" target="_blank">`)
    .replace(/&lt;a href="([^"]+)"&gt;/g, (_, href) => `<a href="${href.replace(/&amp;/g, "&")}">`)
    .replace(/&lt;\/a&gt;/g, "</a>")
    .replace(/&lt;br&gt;/g, "<br>")
    .replace(/&lt;br\/&gt;/g, "<br>");
}

function absoluteInlineHref(href) {
  const value = String(href || "").replace(/&amp;/g, "&").trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\/casino\/categories\//i.test(value)) return `https://new.marathonbet.com/es${value}`;
  if (value.startsWith("/")) return `https://new.marathonbet.com${value}`;
  return value;
}

function inlineLinkHtml(href, label) {
  const safeHref = absoluteInlineHref(href).replace(/"/g, "%22");
  const cleanLabel = String(label || "").replace(/<[^>]+>/g, "").trim();
  if (!cleanLabel || cleanLabel === safeHref) return safeHref;
  if (/^(?:https?:\/\/|\/)\S+$/i.test(cleanLabel)) return safeHref;
  return `<a href="${safeHref}" target="_blank"><i><u>${cleanLabel}</u></i></a>`;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanUrl(raw) {
  return String(raw || "")
    .trim()
    .replace(/^\(+/, "")
    .replace(/\)+$/, "")
    .replace(/\s*&\s*/g, "&")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s+/g, "");
}

function cleanButtonUrlCandidate(raw) {
  const compact = String(raw || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .trim()
    .replace(/^\(+/, "")
    .replace(/\)+$/, "")
    .replace(/\b(https?)\s*:\s*\/\s*\/\s*/iu, "$1://");
  const url = cleanUrl(compact);
  return /^(?:https?:\/\/|\/)\S+$/iu.test(url) ? url : "";
}

function cleanImageButtonAssetUrl(raw) {
  const url = cleanUrl(raw);
  const image = url.match(/^https:\/\/image-gallery-s3(?:-[a-z0-9-]+)?\.mindbox\.ru\/[^?#\s]+?\.png/iu);
  return image ? image[0] : url;
}

function cleanMatchedUrl(raw) {
  return cleanUrl(String(raw || "").replace(/\)+$/g, ""));
}

function isImageGalleryUrl(url) {
  return /^https:\/\/image-gallery-s3(?:-[a-z0-9-]+)?\.mindbox\.ru\//iu.test(cleanImageButtonAssetUrl(url));
}

function spacedImageGalleryUrlMatches(value) {
  const text = stripTagsWithSpaces(value).replace(/&amp;/g, "&");
  const pattern = /https?\s*:\s*\/\s*\/\s*image\s*-\s*gallery\s*-\s*s\s*3(?:\s*-\s*[a-z0-9]+)*\s*\.\s*mindbox\s*\.\s*ru\s*\/[a-z0-9\s.-]+?p\s*n\s*g/giu;

  return [...text.matchAll(pattern)]
    .map((match) => ({ raw: match[0], url: cleanImageButtonAssetUrl(match[0]) }))
    .filter((match) => isImageGalleryUrl(match.url));
}

function imageButtonStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function normalizeImageButtonRow(row) {
  return {
    scope: /^(?:pc|mb6r|mb3b|all)$/i.test(row?.scope || "") ? String(row.scope).toLowerCase() : "all",
    language: normalizeImageButtonLanguage(row?.language || ""),
    text: stripImageGalleryUrlsFromText(row?.text || ""),
    group: String(row?.group || "").replace(/\s+/g, " ").trim(),
    green: cleanImageButtonAssetUrl(row?.green || ""),
    white: cleanImageButtonAssetUrl(row?.white || ""),
    width: Math.max(1, Number.parseInt(row?.width, 10) || 319),
    height: Math.max(1, Number.parseInt(row?.height, 10) || 40),
  };
}

function loadImageButtonRows() {
  const storage = imageButtonStorage();
  if (!storage) return defaultImageButtonRows.map(normalizeImageButtonRow);

  try {
    const saved = JSON.parse(storage.getItem(imageButtonsStorageKey) || "null");
    if (Array.isArray(saved)) {
      const rows = saved.map(normalizeImageButtonRow).filter((row) => row.text && (row.green || row.white));
      if (rows.length) return rows;
    }
  } catch {
    // Ignore broken local edits and fall back to the shipped table.
  }

  return defaultImageButtonRows.map(normalizeImageButtonRow);
}

function persistImageButtonRows() {
  const storage = imageButtonStorage();
  if (!storage) return;
  storage.setItem(imageButtonsStorageKey, JSON.stringify(imageButtonRows));
}

function setSharedImageButtonsStatus(text, tone = "") {
  if (!sharedImageButtonsStatus) return;
  sharedImageButtonsStatus.textContent = text;
  sharedImageButtonsStatus.dataset.tone = tone;
}

function sharedTokenStorage() {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

function sharedImageButtonsTokenValue() {
  return (sharedImageButtonsToken?.value || sharedTokenStorage()?.getItem(sharedImageButtonsTokenKey) || accessPassword || "").trim();
}

function rememberSharedImageButtonsToken() {
  const token = (sharedImageButtonsToken?.value || "").trim();
  if (!token) return;
  sharedTokenStorage()?.setItem(sharedImageButtonsTokenKey, token);
}

function imageButtonRowsForJson(rows = imageButtonRows) {
  return rows
    .map(normalizeImageButtonRow)
    .filter((row) => row.text && (row.green || row.white))
    .sort((a, b) => (
      a.scope.localeCompare(b.scope) ||
      imageButtonLanguageRank(a.language) - imageButtonLanguageRank(b.language) ||
      imageButtonTextKey(a.text).localeCompare(imageButtonTextKey(b.text))
    ));
}

async function fetchSharedImageButtonRows() {
  const response = await fetch(`${sharedImageButtonsUrl}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Cloudflare HTTP ${response.status}`);

  const payload = await response.json();
  return Array.isArray(payload) ? payload : (Array.isArray(payload?.rows) ? payload.rows : []);
}

async function fetchBundledSharedImageButtonRows() {
  const response = await fetch(`${bundledSharedImageButtonsUrl}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return [];

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function loadSharedImageButtons(options = {}) {
  if (!window.fetch) return false;
  if (!options.silent) setSharedImageButtonsStatus("Обновляю общий список...");

  try {
    const sharedRows = await fetchSharedImageButtonRows();
    if (!Array.isArray(sharedRows) || !sharedRows.length) {
      setSharedImageButtonsStatus("Общий список пока пуст, используются встроенные строки.", "muted");
      return false;
    }

    imageButtonRows = imageButtonRowsForJson(sharedRows);
    persistImageButtonRows();
    renderImageButtonTable();
    renderCurrentNotification();
    setSharedImageButtonsStatus(`Загружено из общего спейса: ${sharedRows.length} строк.`, "ok");
    return true;
  } catch (error) {
    const fallbackRows = await fetchBundledSharedImageButtonRows().catch(() => []);
    if (fallbackRows.length) {
      imageButtonRows = imageButtonRowsForJson(fallbackRows);
      persistImageButtonRows();
      renderImageButtonTable();
      renderCurrentNotification();
      setSharedImageButtonsStatus(`Cloudflare недоступен, загружен запасной список: ${fallbackRows.length} строк.`, "error");
      return true;
    }

    setSharedImageButtonsStatus(`Не удалось загрузить общий список: ${error.message}`, "error");
    return false;
  }
}

async function saveSharedImageButtons(options = {}) {
  if (!window.fetch) return;
  const isAuto = options.auto === true;

  if (!isAuto) syncVisibleImageButtonRows({ prune: true });
  persistImageButtonRows();

  const token = sharedImageButtonsTokenValue();
  if (!token) {
    if (!isAuto) {
      setSharedImageButtonsStatus("Для записи в общий спейс нужен пароль.", "error");
      sharedImageButtonsToken?.focus();
    }
    return;
  }

  rememberSharedImageButtonsToken();
  saveSharedImageButtonsBtn.disabled = true;
  setSharedImageButtonsStatus(isAuto ? "Новые картинки найдены, сохраняю в общий спейс..." : "Сохраняю общий список в Cloudflare...");

  try {
    const rows = imageButtonRowsForJson();
    const response = await fetch(sharedImageButtonsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: token, rows }),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error || details.message || `Cloudflare HTTP ${response.status}`);
    }

    const payload = await response.json().catch(() => ({}));
    const savedRows = Array.isArray(payload.rows) ? payload.rows : rows;
    imageButtonRows = imageButtonRowsForJson(savedRows);
    persistImageButtonRows();
    setSharedImageButtonsStatus(`${isAuto ? "Новые картинки сохранены" : "Сохранено"} в общий спейс: ${payload.count || savedRows.length} строк.`, "ok");
    renderImageButtonTable();
    renderCurrentNotification();
  } catch (error) {
    setSharedImageButtonsStatus(`Не удалось сохранить общий список: ${error.message}`, "error");
  } finally {
    saveSharedImageButtonsBtn.disabled = false;
  }
}

function imageButtonTextKey(value) {
  return stripTagsWithSpaces(value)
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function imageButtonRowKey(row) {
  return [
    row.scope || "",
    normalizeImageButtonLanguage(row.language || ""),
    imageButtonTextKey(row.text),
  ].join("|");
}

function mergeImageButtonRows(...rowSets) {
  const rowsByKey = new Map();
  rowSets.flat().forEach((row) => {
    const normalized = normalizeImageButtonRow(row);
    if (!normalized.text || (!normalized.green && !normalized.white)) return;
    rowsByKey.set(imageButtonRowKey(normalized), normalized);
  });
  return [...rowsByKey.values()];
}

function mergeImageButtonRowsPreservingGroups(...rowSets) {
  const rowsByKey = new Map();
  rowSets.flat().forEach((row) => {
    const normalized = normalizeImageButtonRow(row);
    if (!normalized.text || (!normalized.green && !normalized.white)) return;

    const key = imageButtonRowKey(normalized);
    const previous = rowsByKey.get(key);
    rowsByKey.set(key, previous ? {
      ...previous,
      ...normalized,
      group: previous.group || normalized.group,
      green: previous.green || normalized.green,
      white: previous.white || normalized.white,
    } : normalized);
  });
  return [...rowsByKey.values()];
}

function imageButtonRowsChanged(previousRows, nextRows) {
  const previous = new Map(previousRows.map((row) => [imageButtonRowKey(normalizeImageButtonRow(row)), JSON.stringify(normalizeImageButtonRow(row))]));
  if (previous.size !== nextRows.length) return true;

  return nextRows.some((row) => previous.get(imageButtonRowKey(row)) !== JSON.stringify(normalizeImageButtonRow(row)));
}

function scheduleSharedImageButtonsAutosave() {
  if (sharedImageButtonsAutosaveTimer) clearTimeout(sharedImageButtonsAutosaveTimer);
  sharedImageButtonsAutosaveTimer = setTimeout(() => {
    sharedImageButtonsAutosaveTimer = 0;
    saveSharedImageButtons({ auto: true });
  }, 800);
}

function registerDetectedImageButtonRows(rows) {
  const detectedRows = rows.map(normalizeImageButtonRow).filter((row) => row.text && (row.green || row.white));
  if (!detectedRows.length) return;

  const previousRows = imageButtonRows.slice();
  imageButtonRows = mergeImageButtonRowsPreservingGroups(imageButtonRows, detectedRows);
  if (!imageButtonRowsChanged(previousRows, imageButtonRows)) return;

  persistImageButtonRows();
  renderImageButtonTable();
  scheduleSharedImageButtonsAutosave();
}

function normalizeImageButtonLanguage(value) {
  const compact = String(value || "").toUpperCase().replace(/[\s._-]+/g, "");
  if (!compact || compact === "ALL" || compact === "ANY") return "";
  if (compact === "RU" || compact === "RUS" || compact === "RUSSIA") return "RUS";
  if (compact === "EN" || compact === "ENG") return "ENG";
  if (compact === "UZ" || compact === "UZB") return "UZB";
  if (compact === "AZ" || compact === "AZE") return "AZ";
  if (["AR", "ARG", "LAT", "LATAM", "ES", "ESP", "SPA", "ESLATAM"].includes(compact)) return "ES_LATAM";
  return compact;
}

function imageButtonScopeForVersion(version) {
  if (version === "pcMb6r") return "mb6r";
  if (version === "pcMb3b") return "mb3b";
  if (version === "pc") return "pc";
  return "";
}

const imageButtonLanguageOrder = ["RUS", "ENG", "UZB", "ES_LATAM", "AZ"];
const pcImageButtonGroups = [
  {
    id: "insurance",
    label: "За страховкой / Insure Your Bet",
    texts: ["За страховкой", "Insure Your Bet", "Stavkani sug'urtalash", "Apuesta segura", "Mərclərinizi sığortalayın"],
  },
  {
    id: "claim-free-bet",
    label: "За фрибетом / Claim Free Bet",
    texts: ["За фрибетом", "Claim Free Bet", "Fribetni olish", "Apuesta Gratis", "Fribet əldə edin"],
  },
  {
    id: "top-up",
    label: "Пополнить счёт / Deposit",
    texts: ["Пополнить счёт", "Deposit", "Depositar"],
  },
  {
    id: "deposit",
    label: "Внести депозит / Make A Deposit",
    texts: ["Внести депозит", "Make A Deposit", "Depozit qo'yish", "Hacer un depósito", "Depozit qoyun"],
  },
  {
    id: "more-info",
    label: "Подробнее / More Info",
    texts: ["Подробнее", "More Info", "Batafsil", "Más información", "Ətraflı məlumat"],
  },
  {
    id: "claim-bonus",
    label: "Получить бонус / Claim Bonus",
    texts: ["Получить бонус", "Claim Bonus"],
  },
  {
    id: "sportsbook",
    label: "Перейти в линию / Go To Sportsbook",
    texts: ["Перейти в линию", "Go To Sportsbook"],
  },
];
const pcImageButtonGroupByText = new Map(
  pcImageButtonGroups.flatMap((group, index) => group.texts.map((text) => [imageButtonTextKey(text), { ...group, index }]))
);

function imageButtonLanguageRank(language) {
  const index = imageButtonLanguageOrder.indexOf(normalizeImageButtonLanguage(language));
  return index === -1 ? imageButtonLanguageOrder.length : index;
}

function pcImageButtonGroupFor(row) {
  const knownGroup = pcImageButtonGroupByText.get(imageButtonTextKey(row.text));
  const customGroup = String(row.group || "").replace(/\s+/g, " ").trim();
  if (customGroup && (!knownGroup || customGroup !== knownGroup.label)) {
    return {
      id: `custom:${imageButtonTextKey(customGroup)}`,
      label: customGroup,
      index: pcImageButtonGroups.length + 1,
      custom: true,
    };
  }

  return knownGroup || {
    id: "other",
    label: "Без группы",
    index: pcImageButtonGroups.length + 1000,
    other: true,
  };
}

function imageButtonEntryFor(version, button, allowImageButtons = true, language = "") {
  const scope = imageButtonScopeForVersion(version);
  if (!allowImageButtons || !scope) return null;

  const key = imageButtonTextKey(button.text);
  const wantedLanguage = normalizeImageButtonLanguage(language);
  if (!key) return null;

  const candidates = imageButtonRows
    .filter((row) => imageButtonTextKey(row.text) === key)
    .filter((row) => row[button.color])
    .filter((row) => row.scope === scope || row.scope === "all")
    .sort((a, b) => {
      const rank = (row) => (row.scope === scope ? 0 : row.scope === "all" ? 1 : 2);
      const languageRank = (row) => (
        !wantedLanguage ? (row.language ? 1 : 0) : row.language === wantedLanguage ? 0 : row.language ? 2 : 1
      );
      return rank(a) - rank(b) || languageRank(a) - languageRank(b);
    });

  return candidates[0] || null;
}

function buttonSegmentHasRedesignImage(version, segment, options = {}) {
  if (segment?.type !== "button") return false;
  return segment.buttons.some((button) => imageButtonEntryFor(version, button, options.allowImageButtons !== false, options.language));
}

function findUrlMatches(value) {
  const text = String(value || "");
  const matches = [];
  const startRe = /https?:\/\/|\/(?!\/)/giu;
  let startMatch;

  while ((startMatch = startRe.exec(text))) {
    let index = startMatch.index;
    let raw = "";

    while (index < text.length) {
      const char = text[index];

      if (char === "\n" || char === "\r" || char === ")") break;

      if (/\s/u.test(char)) {
        let nextIndex = index + 1;
        while (nextIndex < text.length && /\s/u.test(text[nextIndex])) nextIndex += 1;
        const nextChar = text[nextIndex] || "";
        const previousChar = raw[raw.length - 1] || "";

        if (!nextChar || /^https?:\/\//iu.test(text.slice(nextIndex)) || (nextChar === "/" && text[nextIndex + 1] !== "/")) break;

        if (/[?&=#]/u.test(nextChar) || /[?&=/#]/u.test(previousChar)) {
          index = nextIndex;
          continue;
        }

        break;
      }

      raw += char;
      index += 1;
    }

    if (raw) matches.push({ raw, url: cleanMatchedUrl(raw), index: startMatch.index, end: index });
    startRe.lastIndex = Math.max(index, startMatch.index + startMatch[0].length);
  }

  return matches;
}

function matchedActionUrls(value) {
  return matchedUrls(value).filter((url) => !isImageGalleryUrl(url));
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "").trim();
}

function stripTagsWithSpaces(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function plainOutputText(value) {
  return stripTagsWithSpaces(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeInputText(value) {
  const siteWords = "(?:old\\s*site|oldsite|old\\s*version|oldversion|старый\\s*сайт|redesign\\s*site|redesignsite|redesign|new\\s*site|newsite|new\\s*version|newversion|редизайн|новый\\s*сайт)";
  const buttonWords = "(?:Кнопка\\s*зел[её]ная|Зел[её]ная\\s*кнопка|Button\\s*green|Green\\s*button|Кнопка\\s*белая|Белая\\s*кнопка|Button\\s*white|White\\s*button)";
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/(^|\n)\s*old\s*(?=\n|$)/giu, "$1Old version")
    .replace(/(^|\n)\s*(?:<\/[bi]>\s*)+/gi, "$1")
    .replace(new RegExp(`([^\\n])\\s*((?:<[^>]+>\\s*)*${buttonWords}(?:\\s*<\\/[^>]+>)*)\\s*(?=\\n|$)`, "giu"), "$1\n$2")
    .replace(new RegExp(`((?:https?:\\/\\/|\\/)[^\\n\\s]+?)(?=${buttonWords}\\s*:?)`, "giu"), "$1\n")
    .replace(new RegExp(`(${siteWords})(?=\\s*(?:Кнопка|Button|Green\\s*button|White\\s*button|Зел[её]ная\\s*кнопка|Белая\\s*кнопка))`, "giu"), "$1\n")
    .replace(new RegExp(`(\\([^)]+\\))\\s*(${siteWords})`, "giu"), "$1\n$2")
    .replace(new RegExp(`(https?:\\/\\/[^\\n\\s]+|\\/[^\\n\\s)]+)\\n(?!${siteWords}|${buttonWords}\\s*:?|message\\.service|18\\+)([?&=/#\\w-])`, "giu"), (match, url, next) => (
      isImageGalleryUrl(url) ? `${url}\n${next}` : `${url}${next}`
    ));
}

function siteMarker(line) {
  const plain = stripTagsWithSpaces(line).toLowerCase();
  const compact = plain.replace(/[\s._-]+/g, "");
  if (compact === "oldsite" || compact === "oldversion" || compact === "старыйсайт") return "old";
  if (
    compact === "redesignsite" ||
    compact === "redesign" ||
    compact === "newsite" ||
    compact === "newversion" ||
    compact === "редизайн" ||
    compact === "новыйсайт"
  ) return "redesign";
  return "";
}

function splitSitePrefix(line) {
  const plain = stripTagsWithSpaces(line);
  const lower = plain.toLowerCase();
  const aliases = [
    ["redesign site", "redesign"],
    ["redesignsite", "redesign"],
    ["new version", "redesign"],
    ["newversion", "redesign"],
    ["new site", "redesign"],
    ["newsite", "redesign"],
    ["redesign", "redesign"],
    ["old version", "old"],
    ["oldversion", "old"],
    ["old site", "old"],
    ["oldsite", "old"],
  ];

  for (const [alias, marker] of aliases) {
    if (lower.startsWith(alias)) {
      return { marker, rest: plain.slice(alias.length).trim() };
    }
  }

  return null;
}

function isButtonLine(line) {
  return /^(Кнопка\s*зел[её]ная|Зел[её]ная\s*кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s*кнопка|Button\s*white|White\s*button)\s*:/iu.test(stripTagsWithSpaces(line));
}

function splitSitePrefixedButton(line) {
  const plain = stripTagsWithSpaces(line);
  const compact = plain.toLowerCase().replace(/[\s._-]+/g, "");
  const oldPrefixes = ["oldsite", "oldversion", "старыйсайт"];
  const redesignPrefixes = ["redesignsite", "redesign", "newsite", "newversion", "редизайн", "новыйсайт"];
  const marker = oldPrefixes.some((prefix) => compact.startsWith(prefix))
    ? "old"
    : redesignPrefixes.some((prefix) => compact.startsWith(prefix))
      ? "redesign"
      : "";
  if (!marker) return null;

  const button = plain.match(/(Кнопка\s*зел[её]ная|Зел[её]ная\s*кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s*кнопка|Button\s*white|White\s*button)\s*:/iu);
  if (!button || button.index === 0) return null;

  return { marker, button: plain.slice(button.index).trim() };
}

function matchButtonMarker(line) {
  return stripTagsWithSpaces(line).match(/^(Кнопка\s*зел[её]ная|Зел[её]ная\s*кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s*кнопка|Button\s*white|White\s*button)\s*:?\s*(.*)$/iu);
}

function parseButtonBlockAt(lines, index) {
  const marker = matchButtonMarker(lines[index] || "");
  if (!marker) return null;

  const markerLabel = marker[1];
  let labelText = stripImageGalleryUrlsFromText(marker[2]);
  let cursor = index + 1;

  if (!labelText) {
    while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;
    const candidate = stripImageGalleryUrlsFromText(lines[cursor] || "");
    if (!candidate || cleanButtonUrlCandidate(candidate) || siteMarker(candidate) || splitSitePrefix(candidate)) return null;
    labelText = candidate;
    cursor += 1;
  }

  while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;
  const url = cleanButtonUrlCandidate(lines[cursor] || "");
  if (!url) return null;

  return {
    marker: markerLabel,
    text: labelText,
    url,
    inline: `${markerLabel}: ${labelText} (${url})`,
    nextIndex: cursor + 1,
  };
}

function splitSitePrefixLoose(line) {
  const site = splitSitePrefix(line);
  if (!site) return null;

  return {
    marker: site.marker,
    rest: site.rest.replace(/^[:：]\s*/, "").trim(),
  };
}

function matchedUrls(value) {
  const direct = cleanButtonUrlCandidate(value);
  const urls = findUrlMatches(value).map((match) => match.url);
  return direct ? [direct, ...urls.filter((url) => url !== direct)] : urls;
}

function parseButtonScopedUrlsAt(lines, index) {
  const marker = matchButtonMarker(lines[index] || "");
  if (!marker) return null;

  const markerLabel = marker[1];
  const buttonText = stripImageGalleryUrlsFromText(marker[2]);
  if (!buttonText) return null;

  const variants = [];
  let cursor = index + 1;

  while (cursor < lines.length) {
    while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;

    const site = splitSitePrefixLoose(lines[cursor] || "");
    if (!site) break;

    let urls = matchedActionUrls(site.rest);
    let consumedLines = 1;

    if (!urls.length) {
      urls = matchedActionUrls(stripTags(lines[cursor + 1] || ""));
      if (urls.length) consumedLines = 2;
    }

    if (!urls.length) break;

    if (site.marker === "redesign" && urls.length >= 2) {
      variants.push({ marker: "redesign", url: urls[0] });
      variants.push({ marker: "old", url: urls[1] });
    } else {
      variants.push({ marker: site.marker, url: urls[0] });
    }

    cursor += consumedLines;
  }

  if (!variants.length) return null;
  return {
    marker: markerLabel,
    text: buttonText,
    variants,
    nextIndex: cursor,
  };
}

function serviceKeyNumber(line) {
  const plain = stripTags(line);
  const match = plain.match(/^message\.service(?:\.[a-z0-9_-]+)*\.(\d+)(?:\.topic)?$/i);
  return match ? match[1] : "";
}

function isTopicServiceKeyLine(line) {
  return /^message\.service(?:\.[a-z0-9_-]+)*\.\d+\.topic$/i.test(stripTags(line));
}

function imageGalleryUrlsFromLine(line) {
  const htmlUrls = [...String(line || "").matchAll(/\bhref="([^"]+)"/giu)]
    .map((match) => cleanUrl(match[1]))
    .filter(isImageGalleryUrl);
  const visibleUrls = findUrlMatches(stripTagsWithSpaces(line))
    .map((match) => match.url)
    .filter(isImageGalleryUrl);
  const spacedUrls = spacedImageGalleryUrlMatches(line).map((match) => match.url);

  return [...htmlUrls, ...visibleUrls, ...spacedUrls].filter((url, index, urls) => urls.indexOf(url) === index);
}

function stripImageGalleryUrlsFromText(value) {
  let text = stripTagsWithSpaces(value).replace(/&amp;/g, "&");
  imageGalleryUrlsFromLine(value).forEach((url) => {
    text = text
      .replace(new RegExp(`\\s*\\(?\\s*${escapeRegExp(url)}\\s*\\)?\\s*`, "gu"), " ")
      .replace(new RegExp(`\\s*\\(?\\s*${escapeRegExp(url.replace(/&/g, "&amp;"))}\\s*\\)?\\s*`, "gu"), " ");
  });
  spacedImageGalleryUrlMatches(value).forEach(({ raw }) => {
    text = text.replace(new RegExp(`\\s*\\(?\\s*${escapeRegExp(raw)}\\s*\\)?\\s*`, "gu"), " ");
  });

  return text
    .replace(/\s*\(?\s*https?:\/\/image-gallery-s3(?:-[a-z0-9-]+)?\.mindbox\.ru\/[^\s)\]]+\s*\)?/giu, " ")
    .replace(/\s*\(?\s*https?:?\/{0,2}\s*$/iu, "")
    .replace(/\[\s*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function knownImageButtonGroupLabel(text) {
  return pcImageButtonGroupByText.get(imageButtonTextKey(text))?.label || "";
}

function prepareImageGalleryButtonRows(text) {
  const lines = normalizeInputText(text).split("\n");
  const output = [];
  const detectedRows = [];
  const positionGroups = {};
  let language = "";
  let currentKeyNumber = "";
  let buttonPosition = 0;
  let sectionTextParts = [];

  function groupForPosition(positionKey, buttonText) {
    const known = knownImageButtonGroupLabel(buttonText);
    if (known && !positionGroups[positionKey]) positionGroups[positionKey] = known;
    if (!positionGroups[positionKey]) positionGroups[positionKey] = buttonText;
    return positionGroups[positionKey];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLanguage = languageHeader(line);
    if (nextLanguage) language = normalizeImageButtonLanguage(nextLanguage) || nextLanguage;

    if (isServiceKeyLine(line) && !isTopicServiceKeyLine(line)) {
      currentKeyNumber = serviceKeyNumber(line);
      buttonPosition = 0;
      sectionTextParts = [];
    } else if (isTopicServiceKeyLine(line)) {
      sectionTextParts = [];
    }

    const marker = matchButtonMarker(line);
    const imageUrl = imageGalleryUrlsFromLine(line)[0] || "";
    const nextLine = lines[index + 1] || "";
    const nextLineImageUrl = marker && !imageUrl ? (imageGalleryUrlsFromLine(nextLine)[0] || "") : "";
    const effectiveImageUrl = imageUrl || nextLineImageUrl;

    if (!marker || !effectiveImageUrl) {
      const plain = stripTagsWithSpaces(line);
      if (
        plain &&
        !isServiceKeyLine(line) &&
        !isLineBreakInstruction(line) &&
        !siteMarker(line) &&
        !matchButtonMarker(line) &&
        !matchedActionUrls(plain).length &&
        !imageGalleryUrlsFromLine(line).length
      ) {
        sectionTextParts.push(plain);
      }
      output.push(line);
      continue;
    }

    const markerLabel = marker[1];
    const buttonText = stripImageGalleryUrlsFromText(marker[2] || nextLine);
    if (!buttonText) {
      output.push(line);
      continue;
    }

    buttonPosition += 1;
    const color = buttonColorFromMarker(markerLabel);
    const positionKey = currentKeyNumber ? `${currentKeyNumber}:${buttonPosition}` : "";
    const rowLanguage = language || inferLanguageFromContent(sectionTextParts.join("\n")) || inferLanguageFromContent(buttonText);
    const row = {
      scope: "pc",
      language: rowLanguage,
      text: buttonText,
      group: positionKey ? groupForPosition(positionKey, buttonText) : knownImageButtonGroupLabel(buttonText),
      green: color === "green" ? effectiveImageUrl : "",
      white: color === "white" ? effectiveImageUrl : "",
      width: 319,
      height: 40,
    };

    detectedRows.push(row);
    output.push(marker[2] ? `${markerLabel}: ${buttonText}` : `${markerLabel}:`);
    if (nextLineImageUrl) {
      if (!marker[2]) output.push(buttonText);
      index += 1;
    }
  }

  registerDetectedImageButtonRows(detectedRows);
  return output.join("\n");
}

function normalizeButtonBlocks(value) {
  const lines = prepareImageGalleryButtonRows(value).split("\n");
  const out = [];
  let index = 0;

  function splitMultipleUrls(value) {
    return matchedActionUrls(value);
  }

  function pushExpandedButton(label, text, url) {
    out.push(`${label}:`);
    out.push(stripImageGalleryUrlsFromText(text));
    out.push(`(${cleanButtonUrlCandidate(url) || cleanUrl(url)})`);
  }

  function parseEmbeddedSiteUrlLine(value) {
    const plain = stripTagsWithSpaces(value);
    const urlMatch = findUrlMatches(plain).find((match) => !isImageGalleryUrl(match.url));
    if (!urlMatch) return null;

    const beforeUrl = plain.slice(0, urlMatch.index).trim();
    const url = urlMatch.url;
    const sitePatterns = [
      { re: /redesign\s*site/iu, marker: "redesign" },
      { re: /new\s*version/iu, marker: "redesign" },
      { re: /new\s*site/iu, marker: "redesign" },
      { re: /redesign/iu, marker: "redesign" },
      { re: /old\s*version/iu, marker: "old" },
      { re: /old\s*site/iu, marker: "old" },
    ];

    let bestMatch = null;
    for (const pattern of sitePatterns) {
      const match = pattern.re.exec(beforeUrl);
      if (!match) continue;
      if (!bestMatch || match.index > bestMatch.index) {
        bestMatch = { index: match.index, marker: pattern.marker };
      }
    }

    if (!bestMatch) return null;

    const label = beforeUrl.slice(0, bestMatch.index).trim();
    if (!label) return null;
    return { label, marker: bestMatch.marker, url };
  }

  function buildButtonLine(label, rest, nextLine) {
    const cleanRest = stripImageGalleryUrlsFromText(rest);
    const inlineUrl = cleanRest.match(/^(.+?)\s+\(((?:https?:\/\/|\/)[\s\S]+?)\)?\s*$/iu);
    if (inlineUrl && !isImageGalleryUrl(inlineUrl[2])) {
      return { text: inlineUrl[1].trim(), url: cleanUrl(inlineUrl[2]), consumedNext: false };
    }

    const inlinePlainUrl = cleanRest.match(/^(.+?)\s+((?:https?:\/\/|\/)\S+)\s*$/iu);
    if (inlinePlainUrl && !isImageGalleryUrl(inlinePlainUrl[2])) {
      return { text: inlinePlainUrl[1].trim(), url: cleanUrl(inlinePlainUrl[2]), consumedNext: false };
    }

    const urlMatch = findUrlMatches(cleanRest).find((match) => !isImageGalleryUrl(match.url));
    if (urlMatch && cleanRest.slice(urlMatch.end).trim() === "") {
      return { text: cleanRest.slice(0, urlMatch.index).trim(), url: urlMatch.url, consumedNext: false };
    }

    const url = cleanButtonUrlCandidate(nextLine || "");
    if (cleanRest && url && !isImageGalleryUrl(url)) {
      return { text: cleanRest, url, consumedNext: true };
    }

    return null;
  }

  function urlOnlyLine(value) {
    const url = cleanButtonUrlCandidate(value);
    return isImageGalleryUrl(url) ? "" : url;
  }

  function pushSiteButton(label, site, next, fallbackText = "") {
    const canonicalMarker = site.marker === "old" ? "Old version" : "redesign";
    const siteRest = String(site.rest || "").replace(/^[:：]\s*/, "").trim();

    if (!siteRest && next < lines.length) {
      let labelIndex = next;
      while (labelIndex < lines.length && !stripTags(lines[labelIndex])) labelIndex += 1;
      if (labelIndex >= lines.length) return null;

      const built = buildButtonLine(label, lines[labelIndex], lines[labelIndex + 1]);
      if (!built) {
        const inheritedUrl = fallbackText ? urlOnlyLine(lines[labelIndex]) : "";
        if (!inheritedUrl) return null;

        out.push(canonicalMarker);
        pushExpandedButton(label, fallbackText, inheritedUrl);
        return { nextIndex: labelIndex + 1, text: fallbackText };
      }

      out.push(canonicalMarker);
      pushExpandedButton(label, built.text, built.url);
      return { nextIndex: labelIndex + (built.consumedNext ? 2 : 1), text: built.text };
    }

    const built = buildButtonLine(label, siteRest, lines[next]);
    if (!built) return null;

    out.push(canonicalMarker);
    pushExpandedButton(label, built.text, built.url);
    return { nextIndex: next + (built.consumedNext ? 1 : 0), text: built.text };
  }

  function pushLabeledSiteButtons(label, buttonText, startIndex) {
    let cursor = startIndex;
    let consumedAny = false;

    while (cursor < lines.length) {
      while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;

      const site = splitSitePrefix(lines[cursor] || "");
      if (!site) break;

      let urls = splitMultipleUrls(site.rest);
      let consumedLines = 1;

      if (!urls.length) {
        let urlIndex = cursor + 1;
        while (urlIndex < lines.length && !stripTags(lines[urlIndex])) urlIndex += 1;
        urls = splitMultipleUrls(stripTags(lines[urlIndex] || ""));
        if (urls.length) consumedLines = urlIndex - cursor + 1;
      }

      if (!urls.length) break;

      if (site.marker === "redesign" && urls.length >= 2) {
        out.push("redesign");
        pushExpandedButton(label, buttonText, urls[0]);
        out.push("Old version");
        pushExpandedButton(label, buttonText, urls[1]);
      } else {
        out.push(site.marker === "old" ? "Old version" : "redesign");
        pushExpandedButton(label, buttonText, urls[0]);
      }

      cursor += consumedLines;
      consumedAny = true;
    }

    return consumedAny ? cursor : null;
  }

  while (index < lines.length) {
    const line = lines[index];
    const plain = stripTags(line);
    const bareMarker = plain.match(/^(?:Кнопка\s*зел[её]ная|Зел[её]ная\s*кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s*кнопка|Button\s*white|White\s*button)\s*$/iu);
    if (bareMarker) {
      const embedded = parseEmbeddedSiteUrlLine(lines[index + 1] || "");
      if (embedded) {
        out.push(embedded.marker === "old" ? "Old version" : "redesign");
        pushExpandedButton(plain, embedded.label, embedded.url);
        const consumed = pushLabeledSiteButtons(plain, embedded.label, index + 2);
        index = consumed !== null ? consumed : index + 2;
        continue;
      }

      const labelLine = stripTags(lines[index + 1] || "");
      const site = splitSitePrefix(lines[index + 2] || "");
      const urlLine = stripTags(lines[index + 3] || "");
      const urls = splitMultipleUrls(urlLine);

      if (labelLine && site?.marker === "redesign" && urls.length >= 2) {
        out.push("redesign");
        pushExpandedButton(plain, stripImageGalleryUrlsFromText(labelLine), urls[0]);
        out.push("Old version");
        pushExpandedButton(plain, stripImageGalleryUrlsFromText(labelLine), urls[1]);
        index += 4;
        continue;
      }

      if (labelLine) {
        const consumed = pushLabeledSiteButtons(plain, stripImageGalleryUrlsFromText(labelLine), index + 2);
        if (consumed !== null) {
          index = consumed;
          continue;
        }
      }
    }
    const marker = plain.match(/^(Кнопка\s*зел[её]ная|Зел[её]ная\s*кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s*кнопка|Button\s*white|White\s*button)\s*:?\s*(.*)$/iu);

    if (!marker) {
      out.push(line);
      index += 1;
      continue;
    }

    const label = marker[1];
    let rest = stripImageGalleryUrlsFromText(marker[2]);
    let next = index + 1;
    let consumedSiteButtons = false;
    let inheritedSiteButtonText = "";

    const prefixedRest = splitSitePrefix(rest);
    if (prefixedRest) {
      const consumed = pushSiteButton(label, prefixedRest, next);
      if (consumed !== null) {
        index = consumed.nextIndex;
        inheritedSiteButtonText = consumed.text;
        consumedSiteButtons = true;
      }
    } else {
      const built = buildButtonLine(label, rest, lines[next]);
      if (built) {
        pushExpandedButton(label, built.text, built.url);
        index += built.consumedNext ? 2 : 1;
        continue;
      }

      if (rest) {
        const consumed = pushLabeledSiteButtons(label, rest, next);
        if (consumed !== null) {
          index = consumed;
          continue;
        }
      }
    }

    while (consumedSiteButtons) {
      while (index < lines.length && !stripTags(lines[index])) index += 1;
      const site = splitSitePrefix(lines[index]);
      if (!site) break;
      const consumed = pushSiteButton(label, site, index + 1, inheritedSiteButtonText);
      if (consumed === null) break;
      index = consumed.nextIndex;
      inheritedSiteButtonText = consumed.text || inheritedSiteButtonText;
    }

    if (consumedSiteButtons) {
      continue;
    }

    while (next < lines.length && !stripTags(lines[next])) next += 1;

    if (!rest && next < lines.length) {
      const embedded = parseEmbeddedSiteUrlLine(lines[next] || "");
      if (embedded) {
        out.push(embedded.marker === "old" ? "Old version" : "redesign");
        pushExpandedButton(label, embedded.label, embedded.url);
        const consumed = pushLabeledSiteButtons(label, embedded.label, next + 1);
        index = consumed !== null ? consumed : next + 1;
        continue;
      }

      const labelText = stripImageGalleryUrlsFromText(lines[next]);
      if (labelText && !splitSitePrefix(lines[next])) {
        const consumed = pushLabeledSiteButtons(label, labelText, next + 1);
        if (consumed !== null) {
          index = consumed;
          continue;
        }
      }

      const site = splitSitePrefix(lines[next]);
      if (site) {
        const siteUrlLine = stripTags(lines[next + 1] || "");
        const siteUrls = splitMultipleUrls(siteUrlLine);
        if (site.marker === "redesign" && siteUrls.length >= 2) {
          out.push("redesign");
          pushExpandedButton(label, stripTags(lines[next]), siteUrls[0]);
          out.push("Old version");
          pushExpandedButton(label, stripTags(lines[next]), siteUrls[1]);
          index = next + 2;
          continue;
        }

        const consumed = pushSiteButton(label, site, next + 1);
        if (consumed !== null) {
          index = consumed.nextIndex;
          inheritedSiteButtonText = consumed.text;
          consumedSiteButtons = true;
          while (index < lines.length) {
            while (index < lines.length && !stripTags(lines[index])) index += 1;
            const repeatedSite = splitSitePrefix(lines[index]);
            if (!repeatedSite) break;
            const repeatedConsumed = pushSiteButton(label, repeatedSite, index + 1, inheritedSiteButtonText);
            if (repeatedConsumed === null) break;
            index = repeatedConsumed.nextIndex;
            inheritedSiteButtonText = repeatedConsumed.text || inheritedSiteButtonText;
          }
          continue;
        }
      }

      rest = stripTags(lines[next]);
      const built = buildButtonLine(label, rest, lines[next + 1]);
      if (built) {
        pushExpandedButton(label, built.text, built.url);
        index = next + (built.consumedNext ? 2 : 1);
        continue;
      }
      next += 1;
    }

    while (next < lines.length && !stripTags(lines[next])) next += 1;

    if (rest && next < lines.length) {
      const url = stripTags(lines[next]);
      if (/^\(?((?:https?:\/\/|\/)[^)]+)\)?$/iu.test(url) && !isImageGalleryUrl(url)) {
        out.push(`${label}: ${stripImageGalleryUrlsFromText(rest)} (${cleanUrl(url)})`);
        index = next + 1;
        continue;
      }
    }

    out.push(line);
    index += 1;
  }

  return out.join("\n");
}

function applyNbsp(value, includeDynamic = true) {
  let html = value;
  const amountPattern = "(?:\\d+(?:&nbsp;\\d{3})*(?:[,.]\\d+)?|\\d+(?:[,.]\\d+)?)";
  const currencyPattern = "(?:₽|руб\\.?|BYN|UZS|USD|EUR|AR\\$|US\\$|\\$|€)";
  const currencyFollow = "(?=$|[\\s<.,!?:;)])";

  html = html.replace(/\b(\d{1,3}(?:[ \u00a0]\d{3})+)\b/g, (match) => match.replace(/[ \u00a0]/g, "&nbsp;"));
  html = html.replace(new RegExp(`\\b(${amountPattern})(?:\\s|&nbsp;)+(${currencyPattern})${currencyFollow}`, "giu"), "$1&nbsp;$2");
  html = html.replace(new RegExp(`(${currencyPattern})(?:\\s|&nbsp;)+(${amountPattern})\\b`, "giu"), "$1&nbsp;$2");
  html = html.replace(/(\d+)\s+фриспинов/giu, "$1&nbsp;фриспинов");
  html = html.replace(new RegExp(`(^|[\\s>(])((?:от|до))(?:\\s|&nbsp;)+(${amountPattern}&nbsp;${currencyPattern})`, "giu"), "$1$2&nbsp;$3");
  html = html.replace(new RegExp(`(^|[\\s>(])((?:от|до))(?:\\s|&nbsp;)+(${currencyPattern}&nbsp;${amountPattern})`, "giu"), "$1$2&nbsp;$3");

  const names = includeDynamic ? [...stableNames, ...dynamicStableNames] : stableNames;
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedHtml = escaped.replace(" & ", " &amp; ");
    const replacement = name.replace(/ & /g, "&nbsp;&amp;&nbsp;").replace(/ /g, "&nbsp;");
    html = html.replace(new RegExp(escaped, "g"), replacement);
    html = html.replace(new RegExp(escapedHtml, "g"), replacement);
  }

  return html
    .replace(/На кону —/g, "На&nbsp;кону&nbsp;—")
    .replace(/вас —/g, "вас&nbsp;—");
}

function normalizeBold(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/__(.+?)__/g, "<b>$1</b>");
}

function removeTinyBoldTags(value) {
  return String(value || "").replace(/<b>([\s\S]*?)<\/b>/gi, (match, inner) => {
    const plain = stripTags(inner).replace(/&nbsp;/g, " ").trim();
    return plain.length < 3 ? inner : match;
  });
}

function balanceInlineTags(value) {
  let html = String(value || "");

  ["b", "i", "u"].forEach((tag) => {
    const openRe = new RegExp(`<${tag}>`, "g");
    const closeRe = new RegExp(`</${tag}>`, "g");
    const opens = html.match(openRe)?.length || 0;
    const closes = html.match(closeRe)?.length || 0;

    if (closes > opens) {
      let extra = closes - opens;
      html = html.replace(closeRe, (match) => {
        if (extra <= 0) return match;
        extra -= 1;
        return "";
      });
    } else if (opens > closes) {
      html += `</${tag}>`.repeat(opens - closes);
    }
  });

  return html;
}

function formatInline(line) {
  const normalizedLine = String(line || "").replace(/[ \t]{2,}/g, " ").trim();
  const escaped = restoreAllowedTags(escapeHtml(removeTinyBoldTags(normalizeBold(normalizedLine))));
  return applyNbsp(balanceInlineTags(escaped));
}

function parseButton(matchText, color, label, url) {
  return {
    type: "button",
    color,
    text: String(label || "").replace(/[ \t]{2,}/g, " ").trim(),
    url: cleanUrl(url),
    source: matchText,
  };
}

function buttonColorFromMarker(marker) {
  return /зел|green/i.test(marker) ? "green" : "white";
}

function stripServiceLines(text) {
  return text
    .replace(/^\s*message\.service[\w.-]*(?:\s*[:=].*)?$/gim, "")
    .replace(/^\s*(?:\.topic|topic)\s*[:=].*$/gim, "");
}

function startsWithAgeWarning(line) {
  return stripTags(line).replace(/&nbsp;/g, " ").trim().startsWith("18+");
}

function startsWithFinalAgeWarning(line) {
  return /^18\+\s*[|│]/u.test(stripTags(line).replace(/&nbsp;/g, " ").trim());
}

function trimAfterAgeWarning(text) {
  const lines = String(text || "").split("\n");
  const index = lines.findIndex(startsWithFinalAgeWarning);
  return index === -1 ? lines.join("\n") : lines.slice(0, index + 1).join("\n");
}

function ensureAgeWarningBreak(text) {
  const lines = String(text || "").split("\n");
  let last = lines.length - 1;
  while (last >= 0 && !stripTags(lines[last])) last -= 1;
  if (last < 0 || !startsWithAgeWarning(lines[last])) return lines.join("\n");

  let previous = last - 1;
  while (previous >= 0 && !stripTags(lines[previous])) previous -= 1;
  if (previous >= 0 && lines[previous].trim() === "__BRBR__") return lines.join("\n");

  lines.splice(last, 0, "__BRBR__");
  return lines.join("\n");
}

function isServiceKeyLine(line) {
  const plain = stripTags(line);
  return /^message\.service(?:\.[a-z0-9_-]+)+$/i.test(plain);
}

function isDiscardedServiceLabel(line) {
  return /^(?:MB6R|MB3B|PC)$/i.test(plainOutputText(line));
}

function platformHeader(line) {
  const match = plainOutputText(line).match(/^(MB6R|MB3B|PC)\b/i);
  return match ? match[1].toUpperCase() : "";
}

function isLineBreakInstruction(line) {
  return /^\u041c\u0435\u0436(?:\u0434\u0443)?\u0441\u0442\u0440\u043e\u0447\u043d\u044b\u0439\s+(?:\u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b|\u043f\u0440\u043e\u0431\u0435\u043b)$/iu.test(plainOutputText(line));
}

function serviceKeyBase(key) {
  return key.replace(/\.topic$/i, "");
}

function languageHeader(line) {
  const plain = stripTags(line).replace(/\s+/g, " ").trim();
  const match = plain.match(/^(?:PC|COM|MOB|WEB|APP|AN)?\s*(ENG|EN|RUS|RU|UZB|UZ|KAZ|KZ|SPA|ESP|ES|AR|ARG|LATAM|LAT|POR|PT|FRA|FR|GER|DE|TUR|TR|AZE|AZ|ARM|AM|GEO|KA|UKR|UA)\b/i);
  if (!match) return "";
  return match[1].toUpperCase();
}

function separateLanguageHeaders(value) {
  const out = [];
  let seenLanguageHeader = false;

  for (const line of String(value || "").split("\n")) {
    if (languageHeader(line)) {
      if (seenLanguageHeader && out.length && stripTagsWithSpaces(out[out.length - 1])) out.push("");
      seenLanguageHeader = true;
    }

    out.push(line);
  }

  return out.join("\n");
}

function isBareNumericServiceKey(key) {
  return /^message\.service\.\d+$/i.test(key);
}

function inferLanguageFromContent(value) {
  const text = plainOutputText(value).toLowerCase();
  if (!text) return "";
  if (/[а-яё]/iu.test(text)) return "RUS";
  if (/[\u0259\u018f\u0131\u0130\u011f\u011e\u015f\u015e]/u.test(text) || /(?:fribet\s*[\u0259e]ld[\u0259e]|depozit\s*qoyun|m[\u0259e]bl[\u0259e]\u011find[\u0259e]|\u00fc\u00e7\u00fcn|v[\u0259e]siz[\u0259e]|\u0259trafl[\u0131i])/iu.test(text)) return "AZ";
  if (/[¿¡ñáéíóúü]/iu.test(text) || /\b(?:pod[eé]s|jug[aá]|campeones|responsabilidad)\b/iu.test(text)) return "ARG";
  if (/(?:iltimos|batafsil|jahon|chempion|ishtirok|yapsiz|uchun|bilan|yo'l|o'|g')/iu.test(text)) return "UZB";
  if (/[a-z]/iu.test(text)) return "ENG";
  return "";
}

function topicKey(key, language) {
  return `${language || ""}|${key}`;
}

function keyLabel(section) {
  const key = section.key;
  const match = key.match(/^message\.service\.([a-z]{2,5})\.(\d+)$/i);
  const base = match ? `${match[1]}.${match[2]}` : key.replace(/^.*\.(\d+)$/, "$1");
  return section.language ? `${base} · ${section.language}` : base;
}

function parseNotifications(text) {
  refreshDynamicStableNames(text);
  const lines = normalizeButtonBlocks(text).split("\n");
  const sections = [];
  const topics = {};
  const topicQueues = {};
  let language = "";
  let key = "";
  let sectionLanguage = "";
  let sectionTopic = "";
  let platform = "";
  let sectionPlatform = "";
  let body = [];
  let awaitingTopicFor = "";
  let awaitingTopicLanguage = "";

  function enqueueTopic(topicFor, topicLanguage, topicText) {
    if (!topicQueues[topicFor]) topicQueues[topicFor] = [];
    topicQueues[topicFor].push({ language: topicLanguage, topic: topicText });
    if (!topics[topicKey(topicFor, topicLanguage)]) topics[topicKey(topicFor, topicLanguage)] = topicText;
    if (!topicLanguage && !topics[topicKey(topicFor, "")]) topics[topicKey(topicFor, "")] = topicText;
  }

  function takeQueuedTopic(topicFor, preferredLanguage) {
    const queue = topicQueues[topicFor] || [];
    if (!queue.length) return null;

    const index = preferredLanguage
      ? queue.findIndex((item) => item.language === preferredLanguage || !item.language)
      : 0;
    if (index < 0) return null;

    return queue.splice(index, 1)[0];
  }

  function save() {
    if (!key) return;
    const effectiveLanguage = sectionLanguage || language || inferLanguageFromContent([sectionTopic, ...body].join("\n"));
    sections.push({
      key,
      language: effectiveLanguage,
      platform: sectionPlatform || platform,
      topic: sectionTopic || topics[topicKey(key, effectiveLanguage)] || topics[topicKey(key, "")] || "",
      body: body.join("\n").trim(),
    });
  }

  for (const raw of lines) {
    const plain = stripTags(raw);
    const nextLanguage = languageHeader(raw);
    const nextPlatform = platformHeader(raw);

    if (isDiscardedServiceLabel(raw)) {
      platform = nextPlatform;
      if (key && !body.some((line) => stripTagsWithSpaces(line))) sectionPlatform = platform;
      continue;
    }
    if (isLineBreakInstruction(raw) && (awaitingTopicFor || (key && !body.some((line) => stripTagsWithSpaces(line))))) continue;

    if (nextLanguage) {
      if (key) save();
      language = nextLanguage;
      platform = nextPlatform || "";
      key = "";
      sectionLanguage = "";
      sectionTopic = "";
      sectionPlatform = "";
      body = [];
      awaitingTopicFor = "";
      awaitingTopicLanguage = "";
      continue;
    }

    if (isServiceKeyLine(raw)) {
      if (/\.topic$/i.test(plain)) {
        const baseKey = serviceKeyBase(plain);
        if (key) save();

        awaitingTopicFor = baseKey;
        awaitingTopicLanguage = language;
        key = "";
        sectionLanguage = "";
        sectionTopic = "";
        sectionPlatform = "";
        body = [];
        continue;
      }

      save();
      const queuedTopic = takeQueuedTopic(plain, language);
      key = plain;
      sectionLanguage = queuedTopic?.language || language;
      sectionTopic = queuedTopic?.topic || "";
      sectionPlatform = platform;
      body = [];
      awaitingTopicFor = "";
      continue;
    }

    if (awaitingTopicFor && plain && !/неразрывные\s+пробелы/iu.test(plain)) {
      const inferredLanguage = awaitingTopicLanguage || inferLanguageFromContent(raw);
      enqueueTopic(awaitingTopicFor, inferredLanguage, plainOutputText(raw));
      awaitingTopicFor = "";
      awaitingTopicLanguage = "";
      continue;
    }

    if (/неразрывные\s+пробелы/iu.test(plain)) continue;
    if (key) body.push(raw);
  }

  save();

  if (!sections.length && text.trim()) {
    sections.push({ key: "output", topic: "", body: normalizeButtonBlocks(text) });
  }

  return sections.map((section) => ({
    ...section,
    topic: section.topic || topics[topicKey(section.key, section.language)] || topics[topicKey(section.key, "")] || "",
  }));
}

function bodyForSite(text, target) {
  const lines = normalizeButtonBlocks(text).split("\n");
  const out = [];
  let scope = "";
  let scopedButtonCluster = false;

  function isSharedLandingButtonUrl(url) {
    const raw = String(url || "").replace(/&amp;/g, "&").trim();
    if (!raw || isImageGalleryUrl(raw)) return false;

    try {
      const parsed = new URL(raw, "https://locform.local");
      const urlWeb = parsed.searchParams.get("url_web") || "";
      return /^\/?lps\//iu.test(parsed.pathname.replace(/^\/+/, "")) || /^\/?lps\//iu.test(urlWeb);
    } catch {
      return /^\/?lps\//iu.test(raw);
    }
  }

  function nextMeaningfulIndex(start) {
    let cursor = start;
    while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;
    return cursor;
  }

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const prefixed = splitSitePrefixedButton(line);
    if (prefixed) {
      if (prefixed.marker === target) out.push(prefixed.button);
      scope = "";
      scopedButtonCluster = false;
      index += 1;
      continue;
    }

    const marker = siteMarker(line);
    if (marker) {
      scope = marker;
      scopedButtonCluster = true;
      index += 1;
      continue;
    }

    const scopedUrlsButton = parseButtonScopedUrlsAt(lines, index);
    if (scopedUrlsButton) {
      scopedUrlsButton.variants
        .filter((variant) => variant.marker === target)
        .forEach((variant) => {
          out.push(`${scopedUrlsButton.marker}: ${scopedUrlsButton.text} (${variant.url})`);
        });

      scope = "";
      scopedButtonCluster = false;
      index = scopedUrlsButton.nextIndex;
      continue;
    }

    if (scopedButtonCluster && isLineBreakInstruction(line)) {
      const nextIndex = nextMeaningfulIndex(index + 1);
      if (parseButtonBlockAt(lines, nextIndex) || siteMarker(lines[nextIndex] || "")) {
        index += 1;
        continue;
      }

      scope = "";
      scopedButtonCluster = false;
      out.push(line);
      index += 1;
      continue;
    }

    const buttonBlock = parseButtonBlockAt(lines, index);
    if (buttonBlock) {
      if (scopedButtonCluster) {
        if (
          scope === target ||
          (buttonColorFromMarker(buttonBlock.marker) === "white" && isSharedLandingButtonUrl(buttonBlock.url))
        ) out.push(buttonBlock.inline);
        index = buttonBlock.nextIndex;
        continue;
      }

      out.push(buttonBlock.inline);
      index = buttonBlock.nextIndex;
      continue;
    }

    if (scopedButtonCluster && stripTagsWithSpaces(line)) {
      scope = "";
      scopedButtonCluster = false;
    }

    out.push(line);
    index += 1;
  }

  return out.join("\n");
}

function normalizeTextChunk(text) {
  const normalized = trimAfterAgeWarning(stripServiceLines(text)
    .replace(/\r\n?/g, "\n")
    .replace(/\s*Меж(?:ду)?строчный (?:интервал|пробел)\s*/giu, "\n__BRBR__\n")
    .replace(/([:：])((?:<\/[biu]>\s*)+)([-*•])\s+/giu, "$1$2\n$3 ")
    .replace(/([:：])((?:<\/[biu]>\s*)+)(\d+[.)])\s+/giu, "$1$2\n$3 ")
    .replace(/([:：])\s*([-*•])\s+/gu, "$1\n$2 ")
    .replace(/([:：])\s*(\d+[.)])\s+/gu, "$1\n$2 ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim());

  return ensureAgeWarningBreak(normalized);
}

function numberedParts(text) {
  const matches = [...text.matchAll(/(?:^|\s)(\d+)[.)]\s+/g)];
  if (!matches.length) return null;

  const first = matches[0];
  const intro = text.slice(0, first.index).trim();
  const items = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    return text.slice(start, end).trim();
  }).filter(Boolean);
  const numbers = matches.map((match) => Number(match[1]));

  if (!items.length) return null;
  return { intro, items, numbers };
}

function buildTable(lines) {
  const rows = lines.map((line) => line.split("|").map((cell) => formatInline(cell.trim())).filter(Boolean));
  if (rows.length < 2 || rows.some((row) => row.length < 2)) return null;

  const cellStyle = "border: 1px solid #000; padding: 10px; text-align: center;";
  const body = rows.map((row, index) => {
    const tag = index === 0 ? "th" : "td";
    const cells = row.map((cell) => `    <${tag} style="${cellStyle}">${cell}</${tag}>`).join("\n");
    return `  <tr>\n${cells}\n  </tr>`;
  }).join("\n");

  return `<table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;">\n${body}\n</table>`;
}

function parseTextChunk(text) {
  const normalized = normalizeTextChunk(text);
  if (!normalized) return [];

  const segments = [];
  const lines = normalized.split(/\n+/);
  let tableBuffer = [];
  let listBuffer = null;

  function flushTable() {
    if (!tableBuffer.length) return;
    const table = keepTables.checked ? buildTable(tableBuffer) : null;
    if (table) segments.push({ type: "block", html: table });
    else tableBuffer.forEach((line) => segments.push({ type: "line", html: formatInline(line) }));
    tableBuffer = [];
  }

  function flushList() {
    if (!listBuffer) return;
    const items = listBuffer.items.map((item) => `<li>${formatInline(item)}</li>`).join("\n");
    segments.push({
      type: "block",
      kind: "list",
      listType: listBuffer.type,
      items: listBuffer.items.slice(),
      numbers: listBuffer.numbers ? listBuffer.numbers.slice() : undefined,
      html: `<${listBuffer.type}>\n${items}\n</${listBuffer.type}>`,
    });
    listBuffer = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line === "__BRBR__") {
      flushTable();
      flushList();
      segments.push({ type: "break" });
      continue;
    }

    if (keepTables.checked && line.includes("|")) {
      flushList();
      tableBuffer.push(line);
      continue;
    }

    flushTable();

    const numbered = numberedParts(line);
    if (keepLists.checked && numbered) {
      if (!numbered.intro && numbered.items.length === 1 && /^\d+[.)]\s+/u.test(line)) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [], numbers: [] };
        }
        listBuffer.items.push(numbered.items[0]);
        listBuffer.numbers.push(numbered.numbers[0] || listBuffer.items.length);
        continue;
      }

      flushList();
      if (numbered.intro) segments.push({ type: "line", html: formatInline(numbered.intro) });
      const items = numbered.items.map((item) => `<li>${formatInline(item)}</li>`).join("\n");
      segments.push({
        type: "block",
        kind: "list",
        listType: "ol",
        items: numbered.items,
        numbers: numbered.numbers,
        html: `<ol>\n${items}\n</ol>`,
      });
      continue;
    }

    const listItem = line.match(/^[-*•]\s+(.+)$/u);
    if (keepLists.checked && listItem) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(listItem[1]);
      continue;
    }

    flushList();
    segments.push({ type: "line", html: formatInline(line) });
  }

  flushTable();
  flushList();
  return segments;
}

function extractSegments(input) {
  const buttonPattern = /(Кнопка\s*зел[её]ная|Зел[её]ная\s*кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s*кнопка|Button\s*white|White\s*button)\s*:\s*([^\n(]+?)\s*\(((?:https?:\/\/|\/)[^)]+)\)/giu;
  const segments = [];
  let lastIndex = 0;
  let pendingButtons = [];

  function pushText(text) {
    const parsed = parseTextChunk(text);
    if (parsed.length) {
      flushButtons();
      segments.push(...parsed);
    }
  }

  function flushButtons() {
    if (!pendingButtons.length) return;
    segments.push({ type: "button", buttons: pendingButtons });
    pendingButtons = [];
  }

  for (const match of input.matchAll(buttonPattern)) {
    const between = input.slice(lastIndex, match.index);
    const color = buttonColorFromMarker(match[1]);

    if (between.trim()) pushText(between);
    else if (segments.length && pendingButtons.length === 0) flushButtons();

    pendingButtons.push(parseButton(match[0], color, match[2], match[3]));
    lastIndex = match.index + match[0].length;
  }

  const tail = input.slice(lastIndex);
  if (tail.trim()) pushText(tail);
  flushButtons();

  return segments;
}

function colorKindFromCss(value) {
  const css = String(value || "").toLowerCase();
  if (!css) return null;

  const rgb = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    const [, rText, gText, bText] = rgb;
    const r = Number(rText);
    const g = Number(gText);
    const b = Number(bText);
    if (g > 90 && g > r * 1.25 && g > b * 1.25) return "green";
    if (r > 235 && g > 235 && b > 235) return "white";
  }

  if (/(^|[^a-z])(green|lime|#07974d|#01b462|#008000|#00a000|#00b050)([^a-z]|$)/.test(css)) return "green";
  if (/(^|[^a-z])(white|#fff|#ffffff)([^a-z]|$)/.test(css)) return "white";
  return null;
}

function nodeColorKind(node) {
  let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  while (current) {
    const inline = [
      current.getAttribute("style"),
      current.getAttribute("color"),
      current.getAttribute("bgcolor"),
      current.className,
    ].join(" ");
    const kind = colorKindFromCss(inline);
    if (kind) return kind;
    current = current.parentElement;
  }
  return null;
}

function collectRichPasteLines(root) {
  const lines = [];

  function pushLine(text, color) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return;
    lines.push({ text: clean, color });
  }

  function walkBlock(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let text = "";
    const colors = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.textContent || "";
      if (!value.trim()) continue;
      text += value;
      const kind = nodeColorKind(node);
      if (kind) colors.push(kind);
    }

    const color = colors.find((kind) => kind === "green") || colors.find((kind) => kind === "white") || null;
    pushLine(text, color);
  }

  const blocks = root.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6");
  if (blocks.length) {
    blocks.forEach(walkBlock);
  } else {
    pushLine(root.textContent || "", nodeColorKind(root));
  }

  return lines;
}

function htmlPasteToPlainText(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const lines = collectRichPasteLines(template.content);

  return lines.map(({ text, color }) => {
    if (!color) return text;
    const hasButtonUrl = /\(((?:https?:\/\/|\/)[^)]+)\)/i.test(text);
    const hasExplicitButton = /кнопка|button/i.test(text);
    const hasExplicitColor = /зел[её]ная|белая|green|white/i.test(text);

    if (hasButtonUrl && hasExplicitButton && !hasExplicitColor) {
      return `${color === "green" ? "Зеленая кнопка" : "Белая кнопка"}: ${text.replace(/^кнопка\s*:?\s*/iu, "")}`;
    }

    return text;
  }).join("\n");
}

window.htmlPasteToPlainText = htmlPasteToPlainText;

function wordColorKind(value) {
  const color = String(value || "").replace(/^#/, "").toLowerCase();
  if (!color || color === "auto") return null;
  if (color === "green" || /^(?:07974d|01b462|008000|00a000|00b050|92d050|70ad47)$/.test(color)) return "green";
  if (color === "white" || color === "ffffff") return "white";
  return null;
}

function xmlChildrenByLocalName(node, localName) {
  return [...node.getElementsByTagName("*")].filter((child) => child.localName === localName);
}

function xmlAttribute(node, localName) {
  if (!node) return "";
  return node.getAttribute(localName)
    || [...node.attributes].find((attribute) => attribute.localName === localName)?.value
    || "";
}

function runText(run) {
  return xmlChildrenByLocalName(run, "t").map((node) => node.textContent || "").join("");
}

function runHighlightColor(run) {
  const rPr = xmlChildrenByLocalName(run, "rPr")[0];
  if (!rPr) return null;

  const highlight = xmlChildrenByLocalName(rPr, "highlight")[0];
  const highlightColor = wordColorKind(xmlAttribute(highlight, "val"));
  if (highlightColor) return highlightColor;

  const shading = xmlChildrenByLocalName(rPr, "shd")[0];
  return wordColorKind(xmlAttribute(shading, "fill"));
}

function pushHighlightHint(hints, text, color) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean || !color) return;
  hints.push({ text: clean, color });
}

function pushInlineLinkHint(hints, text, href) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const cleanHref = String(href || "").trim();
  if (!clean || !cleanHref) return;
  hints.push({ text: clean, href: cleanHref });
}

function relationshipTargetMap(xmlText) {
  const map = {};
  if (!xmlText) return map;

  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  [...xml.getElementsByTagName("*")]
    .filter((node) => node.localName === "Relationship")
    .forEach((node) => {
      const id = node.getAttribute("Id");
      const target = node.getAttribute("Target");
      if (id && target) map[id] = target;
    });

  return map;
}

async function extractDocxHighlightHints(arrayBuffer) {
  if (typeof JSZip === "undefined") return [];

  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) return [];

  const xmlText = await documentFile.async("string");
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const paragraphs = [...xml.getElementsByTagName("*")].filter((node) => node.localName === "p");
  const hints = [];

  paragraphs.forEach((paragraph) => {
    const combined = { green: "", white: "" };
    let activeColor = null;
    let activeText = "";

    xmlChildrenByLocalName(paragraph, "r").forEach((run) => {
      const text = runText(run);
      const color = runHighlightColor(run);
      if (!text) return;

      if (color === "green" || color === "white") {
        combined[color] += text;
        if (activeColor === color) activeText += text;
        else {
          pushHighlightHint(hints, activeText, activeColor);
          activeColor = color;
          activeText = text;
        }
        return;
      }

      pushHighlightHint(hints, activeText, activeColor);
      activeColor = null;
      activeText = "";
    });

    pushHighlightHint(hints, activeText, activeColor);
    pushHighlightHint(hints, combined.green, "green");
    pushHighlightHint(hints, combined.white, "white");
  });

  const seen = new Set();
  return hints.filter((hint) => {
    const key = `${hint.color}:${hint.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function extractDocxInlineLinkHints(arrayBuffer) {
  if (typeof JSZip === "undefined") return [];

  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) return [];

  const [xmlText, relsText] = await Promise.all([
    documentFile.async("string"),
    zip.file("word/_rels/document.xml.rels")?.async("string") || Promise.resolve(""),
  ]);
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const rels = relationshipTargetMap(relsText);
  const hints = [];

  [...xml.getElementsByTagName("*")]
    .filter((node) => node.localName === "hyperlink")
    .forEach((node) => {
      const id = xmlAttribute(node, "id");
      pushInlineLinkHint(hints, xmlChildrenByLocalName(node, "t").map((item) => item.textContent || "").join(""), rels[id]);
    });

  [...xml.getElementsByTagName("*")]
    .filter((node) => node.localName === "p")
    .forEach((paragraph) => {
      let href = "";
      let text = "";
      let collecting = false;

      xmlChildrenByLocalName(paragraph, "r").forEach((run) => {
        const fldChar = xmlChildrenByLocalName(run, "fldChar")[0];
        const fldType = xmlAttribute(fldChar, "fldCharType");

        if (fldType === "begin") {
          href = "";
          text = "";
          collecting = false;
          return;
        }

        const instr = xmlChildrenByLocalName(run, "instrText").map((item) => item.textContent || "").join("");
        const match = instr.match(/HYPERLINK\s+"([^"]+)"/i);
        if (match) {
          href = match[1];
          return;
        }

        if (fldType === "separate") {
          collecting = Boolean(href);
          return;
        }

        if (fldType === "end") {
          pushInlineLinkHint(hints, text, href);
          href = "";
          text = "";
          collecting = false;
          return;
        }

        if (collecting) text += runText(run);
      });
    });

  const seen = new Set();
  return hints.filter((hint) => {
    const key = `${hint.href}:${hint.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function looseTextKey(value) {
  return stripTags(value).toLowerCase().replace(/&nbsp;/g, " ").replace(/[\s'’`.,:;!?()[\]{}"«»<>|\\/-]+/g, "");
}

function matchingHighlightHint(line, hints) {
  const lineKey = looseTextKey(line);
  return hints
    .filter((hint) => hint.color === "green" || hint.color === "white")
    .filter((hint) => looseTextKey(hint.text).length >= 3)
    .sort((a, b) => looseTextKey(b.text).length - looseTextKey(a.text).length)
    .find((hint) => lineKey.includes(looseTextKey(hint.text)));
}

function isUrlOnlyLine(line) {
  return /^(?:https?:\/\/|\/)\S+$/i.test(stripTags(line).replace(/&amp;/g, "&"));
}

function buttonMarkerForColor(color) {
  return color === "white" ? "Button white" : "Button green";
}

function buttonLabelFromHighlightedLine(line) {
  return stripTags(line).replace(/^(?:кнопка|button)\s*:?\s*/iu, "").trim();
}

function applyDocxHighlightButtonHints(text, hints = []) {
  if (!hints.length) return text;

  const lines = String(text || "").split("\n");
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isButtonLine(line)) {
      output.push(line);
      continue;
    }

    const hint = matchingHighlightHint(line, hints);
    if (!hint) {
      output.push(line);
      continue;
    }

    if (/\(((?:https?:\/\/|\/)[^)]+)\)/i.test(line)) {
      const label = line.replace(/^(?:кнопка|button)\s*:?\s*/iu, "");
      output.push(`${buttonMarkerForColor(hint.color)}: ${label}`);
      continue;
    }

    if (/^(?:\s*<[^>]+>)*\s*(?:кнопка|button)/iu.test(line) && isUrlOnlyLine(lines[index + 1] || "")) {
      const label = buttonLabelFromHighlightedLine(line);
      output.push(`${buttonMarkerForColor(hint.color)}: ${label}`);
      continue;
    }

    output.push(line);
  }

  return output.join("\n");
}

function inlineLinkPattern(label) {
  const parts = String(label || "").trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!parts.length) return null;
  return new RegExp(parts.join("[\\s\\u00a0]+"), "gu");
}

function applyDocxInlineLinkHints(text, hints = []) {
  if (!hints.length) return text;

  return String(text || "").split("\n").map((line) => {
    const chunks = line.split(/(<a href="[^"]+"(?: target="_blank")?>[\s\S]*?<\/a>)/g);

    return chunks.map((chunk) => {
      if (/^<a href=/.test(chunk)) return chunk;

      return hints
        .slice()
        .sort((a, b) => b.text.length - a.text.length)
        .reduce((value, hint) => {
          const pattern = inlineLinkPattern(hint.text);
          if (!pattern) return value;
          return value.replace(pattern, (match) => inlineLinkHtml(hint.href, match));
        }, chunk);
    }).join("");
  }).join("\n");
}

function normalizeDocxHtml(html, highlightHints = [], inlineLinkHints = []) {
  let text = String(html || "");

  text = text.replace(/&amp;/g, "&");
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => inlineLinkHtml(href, inner));

  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<em>/gi, "<i>")
    .replace(/<\/em>/gi, "</i>")
    .replace(/<h[1-6][^>]*>/gi, "<b>")
    .replace(/<\/h[1-6]>/gi, "</b>\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<(?!\/?(?:b|i|u|a)\b)[^>]+>/gi, "");

  text = text
    .replace(/(?:<b>)?(message\.service(?:\.[a-z]{2,5})?\.\d+\.topic)(?:<\/b>)?/gi, "\n$1\n")
    .replace(/(?:<b>)?(message\.service(?:\.[a-z]{2,5})?\.\d+)(?![\d.])(?:<\/b>)?/gi, "\n$1\n");
  let seenTopicKey = false;
  text = text.replace(/\n(message\.service(?:\.(?!topic\b)[a-z0-9_-]+)+\.topic)\n/gi, (_, topicKeyText) => {
    const prefix = seenTopicKey ? "\n\n" : "\n";
    seenTopicKey = true;
    return `${prefix}${topicKeyText}\n`;
  });

  text = applyDocxInlineLinkHints(text, inlineLinkHints);
  text = applyDocxHighlightButtonHints(text, highlightHints);
  text = separateLanguageHeaders(text);

  return normalizeInputText(text).trim();
}

function makeButtonHtml(version, buttons, options = {}) {
  if (!buttons.length) return "";

  const green = buttons.find((button) => button.color === "green");
  const white = buttons.find((button) => button.color === "white");
  const safeText = (value) => applyNbsp(restoreAllowedTags(escapeHtml(value)), false);
  const safeAttr = (value) => escapeAttribute(value);
  const visibleLength = (value) => stripTagsWithSpaces(value).length;
  const compactSize = (button) => (visibleLength(button.text) > 20 ? "width: 180px; height: 35px;" : "width: 140px; height: 25px;");
  const redesignAccent = version === "pcMb6r" ? "#00B777" : "#01B462";
  const allowImageButtons = options.allowImageButtons !== false;
  const imageButtonLanguage = options.language || "";
  const redesignTextAnchor = (button, index = 0) => {
    const isWhite = button.color === "white";
    const margin = index ? "\n\n  " : "";
    return `${margin}<a href="${button.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${isWhite ? "transparent" : redesignAccent}; color: ${isWhite ? redesignAccent : "#FFFFFF"}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: ${isWhite ? `2px solid ${redesignAccent}` : "none"};">\n    ${safeText(button.text)}\n  </a>`;
  };
  const redesignImageAnchor = (button, entry, index = 0) => {
    const imageUrl = entry[button.color];
    const width = entry.width || 319;
    const height = entry.height || 40;
    const margin = index ? `12px auto 0` : "0 auto";

    return `<a href="${button.url}" target="_blank" style="display:block; width:${width}px; max-width:100%; margin:${margin}; padding:0; border:0; text-decoration:none;"><img src="${imageUrl}" width="${width}" height="${height}" alt="${safeAttr(button.text)}" style="display:block; width:${width}px; max-width:100%; height:${height}px; border:0; outline:none; text-decoration:none;"></a>`;
  };

  if ((version === "pc" || version === "pcMb6r" || version === "pcMb3b") && allowImageButtons) {
    const imageEntries = buttons.map((button) => imageButtonEntryFor(version, button, allowImageButtons, imageButtonLanguage));
    if (imageEntries.some(Boolean)) {
      return buttons.map((button, index) => (
        imageEntries[index]
          ? redesignImageAnchor(button, imageEntries[index], index)
          : redesignTextAnchor(button, index)
      )).join("\n");
    }
  }

  const hasDuplicateColors = new Set(buttons.map((button) => button.color)).size !== buttons.length;
  if (buttons.length > 2 || hasDuplicateColors) {
    const anchor = (button, index) => {
      const isWhite = button.color === "white";
      const margin = index ? (version === "compact" ? "\n\n  " : "\n\n  ") : "";

      if (version === "compact") {
        return `${margin}<a href="${button.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(button)} padding: 0 12px;\n            background-color: ${isWhite ? "transparent" : "#07974D"}; color: ${isWhite ? "#07974D" : "#FFFFFF"}; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: ${isWhite ? "1px solid #07974D" : "none"};">\n    ${safeText(button.text)}\n  </a>`;
      }

      if (version === "mobile") {
        return `${margin}<a href="${button.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;${index ? " margin-top: 6px;" : ""}\n            background-color: ${isWhite ? "transparent" : "#07974D"}; color: ${isWhite ? "#07974D" : "#FFFFFF"}; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: ${isWhite ? "1px solid #07974D" : "none"}; transform: rotate(0deg);">\n    ${safeText(button.text)}\n  </a>`;
      }

      return `${margin}<a href="${button.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${isWhite ? "transparent" : redesignAccent}; color: ${isWhite ? redesignAccent : "#FFFFFF"}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: ${isWhite ? `2px solid ${redesignAccent}` : "none"};">\n    ${safeText(button.text)}\n  </a>`;
    };

    if (version === "compact") return `<div style="display: inline-flex; gap: 8px;">\n  ${buttons.map(anchor).join("")}\n</div>`;
    if (version === "mobile") return `<div style="display: flex; flex-direction: column;">\n  ${buttons.map(anchor).join("")}\n</div>`;
    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  ${buttons.map(anchor).join("")}\n\n</div>`;
  }

  if (!green && white) {
    if (version === "compact") {
      return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(white)} padding: 0 12px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D;">\n    ${safeText(white.text)}\n  </a>\n</div>`;
    }

    if (version === "mobile") {
      return `<div style="display: flex; flex-direction: column;">\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D; transform: rotate(0deg);">\n    ${safeText(white.text)}\n  </a>\n</div>`;
    }

    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${white.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: transparent; color: ${redesignAccent}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: 2px solid ${redesignAccent};">\n    ${safeText(white.text)}\n  </a>\n\n</div>`;
  }

  if (!white) {
    if (version === "compact") {
      return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(green)} padding: 0 12px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none;">\n    ${safeText(green.text)}\n  </a>\n</div>`;
    }

    if (version === "mobile") {
      return `<div style="display: flex; flex-direction: column;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none; transform: rotate(0deg);">\n    ${safeText(green.text)}\n  </a>\n</div>`;
    }

    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${green.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${redesignAccent}; color: #FFFFFF; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n</div>`;
  }

  if (version === "compact") {
    return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(green)} padding: 0 12px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(white)} padding: 0 12px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D;">\n    ${safeText(white.text)}\n  </a>\n</div>`;
  }

  if (version === "mobile") {
    return `<div style="display: flex; flex-direction: column;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none; transform: rotate(0deg);">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px; margin-top: 6px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D; transform: rotate(0deg);">\n    ${safeText(white.text)}\n  </a>\n</div>`;
  }

  return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${green.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${redesignAccent}; color: #FFFFFF; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: transparent; color: ${redesignAccent}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: 2px solid ${redesignAccent};">\n    ${safeText(white.text)}\n  </a>\n\n</div>`;
}

function renderSegments(version, segments, options = {}) {
  const rendered = [];

  function segmentHtml(segment) {
    if (segment.type === "button") return makeButtonHtml(version, segment.buttons, options);
    if (version === "compact" && segment.kind === "list") {
      return segment.items.map((item, index) => {
        const marker = segment.listType === "ol" ? `${segment.numbers?.[index] || index + 1}.&nbsp;` : "&bull;&nbsp;";
        return `${marker}${formatInline(item)}`;
      }).join("<br>\n");
    }
    return segment.html;
  }

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const next = segments[index + 1];
    const previous = segments[index - 1];

    if (segment.type === "break") {
      const isRedesignVersion = version === "pc" || version === "pcMb6r" || version === "pcMb3b";
      if (previous?.kind === "list") {
        const listBreak = version === "compact" ? "<br><br>\n" : "\n<br>\n";
        const lastRendered = String(rendered[rendered.length - 1] || "");
        if (version === "compact") {
          if (!lastRendered.includes("<br><br>")) rendered.push(listBreak);
        } else if (!lastRendered.match(/<br>\s*$/)) {
          rendered.push(listBreak);
        }
        continue;
      }
      if (isRedesignVersion && previous?.type === "button" && buttonSegmentHasRedesignImage(version, previous, options)) {
        const breakHtml = next?.type === "line" && startsWithAgeWarning(next.html)
          ? "\n\n<br><br>\n\n"
          : "\n\n<br>\n\n";
        if (!String(rendered[rendered.length - 1] || "").match(/<br>\s*$/)) rendered.push(breakHtml);
        continue;
      }
      if (isRedesignVersion && next?.type === "button") {
        if (buttonSegmentHasRedesignImage(version, next, options) && !String(rendered[rendered.length - 1] || "").includes("<br><br>")) {
          rendered.push("\n\n<br><br>\n\n");
        }
        continue;
      }
      if (!String(rendered[rendered.length - 1] || "").includes("<br><br>")) rendered.push("\n\n<br><br>\n\n");
      continue;
    }

    const html = segmentHtml(segment);
    if (!html) continue;

    if ((version === "compact" || version === "mobile") && segment.type === "button") {
      const lastRendered = String(rendered[rendered.length - 1] || "");
      if (!lastRendered.includes("<br><br>") && !lastRendered.match(/<br>\s*$/)) rendered.push("\n\n<br><br>\n\n");
      rendered.push(html);
      continue;
    }

    const previousLineEndsWithColon = previous?.type === "line" && /[:：]$/u.test(plainOutputText(previous.html));
    const separator = previous?.type === "line" && segment.type === "line"
      ? "<br>\n"
      : previousLineEndsWithColon && segment.kind === "list"
        ? version === "compact" ? "<br><br>\n" : "\n"
        : version === "compact" && previous?.kind === "list"
          ? "<br><br>\n"
        : "\n\n";
    if (rendered.length && rendered[rendered.length - 1] !== "<br><br>") rendered.push(separator);
    rendered.push(html);
  }

  return rendered.join("").replace(/\n{3,}/g, "\n\n").trim();
}

function renderTopicOutput(topic) {
  const plainTopic = String(topic || "").trim();
  if (!plainTopic) return "";

  const redesignTopic = applyNbsp(escapeHtml(plainTopic));
  if (redesignTopic === escapeHtml(plainTopic)) return plainTopic;

  return `${plainTopic}\n\nredesign\n${redesignTopic}`;
}

function redesignUrlFromOld(url) {
  const raw = String(url || "").replace(/&amp;/g, "&").trim();
  let parsed;

  try {
    parsed = new URL(raw, "https://locform.local");
  } catch {
    return raw;
  }

  const urlWeb = parsed.searchParams.get("url_web");
  if (!urlWeb) return raw;

  const cleanPath = urlWeb.trim();
  if (!cleanPath || /^lps\//i.test(cleanPath.replace(/^\/+/, ""))) return raw;

  const relativePath = `/${cleanPath
    .replace(/^\/+/, "")
    .replace(/^(?:en|su|ru|rus|uzb|uz|ar|arg|latam|lat|es|spa|esp)\//i, "")}`;

  const params = new URLSearchParams(parsed.search);
  params.delete("url_web");
  const query = params.toString().replace(/\+/g, "%20");

  return query ? `${relativePath}?${query}` : relativePath;
}

function normalizeRedesignSegments(segments) {
  return segments.map((segment) => {
    if (segment.type !== "button") return segment;
    return {
      ...segment,
      buttons: segment.buttons.map((button) => ({
        ...button,
        url: redesignUrlFromOld(button.url),
      })),
    };
  });
}

function renderImageScopeTabs() {
  if (!imageScopeTabs) return;

  imageScopeTabs.querySelectorAll("[data-image-scope]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.imageScope === activeImageButtonScope);
  });
}

function renderImageButtonTable() {
  if (!imageButtonRowsBody) return;

  renderImageScopeTabs();

  const visibleRows = imageButtonRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.scope === activeImageButtonScope);

  const displayRows = activeImageButtonScope === "pc"
    ? visibleRows
      .map((item) => ({ ...item, group: pcImageButtonGroupFor(item.row) }))
      .sort((a, b) => (
        a.group.index - b.group.index ||
        a.group.label.localeCompare(b.group.label) ||
        imageButtonLanguageRank(a.row.language) - imageButtonLanguageRank(b.row.language) ||
        imageButtonTextKey(a.row.text).localeCompare(imageButtonTextKey(b.row.text))
      ))
    : visibleRows;

  let lastGroupId = "";
  imageButtonRowsBody.innerHTML = displayRows.map(({ row, index, group }) => {
    const inheritedGroupLabel = activeImageButtonScope === "pc" && group && !group.other ? group.label : "";
    const groupHead = group && group.id !== lastGroupId
      ? `<tr class="image-group-row${group.other ? " image-group-row-empty" : ""}">
          <td colspan="8">
            <div class="image-group-head">
              <span>${escapeHtml(group.label)}</span>
              <button class="image-group-remove" type="button" data-image-remove-group="${escapeAttribute(group.id)}">Удалить блок</button>
            </div>
          </td>
        </tr>`
      : "";
    if (group) lastGroupId = group.id;

    return `${groupHead}
    <tr data-image-index="${index}">
      <td><input data-image-field="language" type="text" value="${escapeAttribute(row.language || "")}" placeholder="RUS / ENG / UZB"></td>
      <td><input data-image-field="text" type="text" value="${escapeAttribute(row.text)}" placeholder="Текст кнопки"></td>
      <td><input data-image-field="group" type="text" value="${escapeAttribute(row.group || inheritedGroupLabel)}" placeholder="Напр. Подробнее / More Info"${activeImageButtonScope === "pc" ? "" : " disabled"}></td>
      <td><input data-image-field="green" type="url" value="${escapeAttribute(row.green)}" placeholder="URL зеленой картинки"></td>
      <td><input data-image-field="white" type="url" value="${escapeAttribute(row.white)}" placeholder="URL белой картинки"></td>
      <td><input data-image-field="width" type="number" min="1" value="${row.width || 319}"></td>
      <td><input data-image-field="height" type="number" min="1" value="${row.height || 40}"></td>
      <td><button class="image-row-remove" type="button" data-image-remove="${index}" aria-label="Удалить строку">×</button></td>
    </tr>
  `;
  }).join("");
}

function syncVisibleImageButtonRows({ removeIndex = null, prune = false } = {}) {
  if (!imageButtonRowsBody) return;

  const nextRows = imageButtonRows.slice();
  imageButtonRowsBody.querySelectorAll("tr").forEach((row) => {
    const index = Number(row.dataset.imageIndex);
    if (!Number.isFinite(index) || index === removeIndex) return;

    const value = (field) => row.querySelector(`[data-image-field="${field}"]`)?.value || "";
    const previous = imageButtonRows[index] || {};
    nextRows[index] = normalizeImageButtonRow({
      scope: previous.scope || activeImageButtonScope,
      language: value("language"),
      text: value("text"),
      group: previous.scope === "pc" || activeImageButtonScope === "pc" ? value("group") : previous.group,
      green: value("green"),
      white: value("white"),
      width: value("width"),
      height: value("height"),
    });
  });

  imageButtonRows = nextRows
    .filter((_, index) => index !== removeIndex)
    .filter((row) => !prune || (row.text && (row.green || row.white)));
}

function removeImageButtonGroup(groupId) {
  if (!groupId || activeImageButtonScope !== "pc") return;

  syncVisibleImageButtonRows();
  imageButtonRows = imageButtonRows.filter((row) => (
    row.scope !== activeImageButtonScope || pcImageButtonGroupFor(row).id !== groupId
  ));
  persistImageButtonRows();
  renderImageButtonTable();
  renderCurrentNotification();
  setSharedImageButtonsStatus("Блок удален локально. Чтобы удалить его для всех, нажмите «Сохранить в общий».", "muted");
}

function openImageButtons() {
  const savedToken = sharedTokenStorage()?.getItem(sharedImageButtonsTokenKey);
  if (savedToken && sharedImageButtonsToken && !sharedImageButtonsToken.value) sharedImageButtonsToken.value = savedToken;
  renderImageButtonTable();
  imageButtonsModal.hidden = false;
}

function closeImageButtons() {
  imageButtonsModal.hidden = true;
}

function renderKeyTabs() {
  if (!parsedNotifications.length) {
    keyTabs.innerHTML = '<span class="key-empty">Ключи появятся после преобразования</span>';
    copyKeyBtn.disabled = true;
    copyTopicKeyBtn.disabled = true;
    return;
  }

  keyTabs.innerHTML = parsedNotifications.map((section, index) => (
    `<button class="key-tab${index === activeNotificationIndex ? " active" : ""}" type="button" data-key-index="${index}" title="${escapeHtml(section.key)}">${escapeHtml(keyLabel(section))}</button>`
  )).join("");
  copyKeyBtn.disabled = false;
  copyTopicKeyBtn.disabled = false;
}

function renderCurrentNotification() {
  const section = parsedNotifications[activeNotificationIndex];

  if (!section) {
    Object.values(outputs).forEach((output) => { output.value = ""; });
    copyKeyBtn.disabled = true;
    copyTopicKeyBtn.disabled = true;
    updatePreview();
    return;
  }

  outputs.topic.value = renderTopicOutput(section.topic);

  const oldSegments = extractSegments(bodyForSite(section.body, "old"));
  const redesignSegments = extractSegments(bodyForSite(section.body, "redesign"));
  const redesignRenderSegments = redesignSegments.some((segment) => segment.type === "button")
    ? normalizeRedesignSegments(redesignSegments)
    : normalizeRedesignSegments(oldSegments);
  const renderOptions = {
    allowImageButtons: true,
    language: section.language,
  };

  outputs.compact.value = renderSegments("compact", oldSegments);
  outputs.mobile.value = renderSegments("mobile", oldSegments);
  outputs.pc.value = renderSegments("pc", redesignRenderSegments, renderOptions);
  outputs.pcMb6r.value = renderSegments("pcMb6r", redesignRenderSegments, renderOptions);
  outputs.pcMb3b.value = renderSegments("pcMb3b", redesignRenderSegments, renderOptions);

  updatePreview();
}

function convert() {
  parsedNotifications = parseNotifications(sourceText.value);
  activeNotificationIndex = 0;
  renderKeyTabs();
  renderCurrentNotification();
}

function activeVersion() {
  return document.querySelector(".tab.active").dataset.tab;
}

function updatePreview() {
  preview.innerHTML = previewHtml(outputs[activeVersion()].value || "");
}

function previewHtml(html) {
  return html
    .replace(/\n\s*(?=<\/?(?:div|a|ol|ul|li|table|tr|td|th)\b)/g, "")
    .replace(/(<\/?(?:div|a|ol|ul|li|table|tr|td|th)[^>]*>)\s*\n/g, "$1")
    .replace(/\n{2,}/g, "\n");
}

function setSourceText(value) {
  sourceText.value = value;
  if (autoConvert.checked) convert();
}

function appendSourceText(value) {
  const start = sourceText.selectionStart ?? sourceText.value.length;
  const end = sourceText.selectionEnd ?? sourceText.value.length;
  sourceText.setRangeText(value, start, end, "end");
  if (autoConvert.checked) convert();
}

async function readDroppedFile(file) {
  if (/\.docx$/i.test(file.name)) {
    if (typeof mammoth === "undefined") {
      window.alert("Не удалось загрузить .docx: Mammoth.js недоступен.");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const [highlightHints, inlineLinkHints, result] = await Promise.all([
      extractDocxHighlightHints(arrayBuffer.slice(0)).catch(() => []),
      extractDocxInlineLinkHints(arrayBuffer.slice(0)).catch(() => []),
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) }),
    ]);
    setSourceText(normalizeDocxHtml(result.value, highlightHints, inlineLinkHints));
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const raw = String(reader.result || "");
    setSourceText(/\.html?$/i.test(file.name) ? htmlPasteToPlainText(raw) : raw);
  });
  reader.readAsText(file);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".result").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("active");
    updatePreview();
  });
});

keyTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-key-index]");
  if (!button) return;
  activeNotificationIndex = Number(button.dataset.keyIndex);
  renderKeyTabs();
  renderCurrentNotification();
});

function activeNotification() {
  return parsedNotifications[activeNotificationIndex] || null;
}

function topicKeyFor(section) {
  return `${serviceKeyBase(section.key)}.topic`;
}

async function copyTextWithFeedback(button, text) {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  const oldText = button.textContent;
  button.textContent = "Скопировано";
  setTimeout(() => {
    button.textContent = oldText;
  }, 1200);
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const version = button.dataset.copy;
    await copyTextWithFeedback(button, outputs[version].value);
  });
});

copyKeyBtn.addEventListener("click", async () => {
  const section = activeNotification();
  await copyTextWithFeedback(copyKeyBtn, section?.key || "");
});

copyTopicKeyBtn.addEventListener("click", async () => {
  const section = activeNotification();
  await copyTextWithFeedback(copyTopicKeyBtn, section ? topicKeyFor(section) : "");
});

function openGuide() {
  guideModal.hidden = false;
}

function closeGuide() {
  guideModal.hidden = true;
}

function unlockApp() {
  sessionStorage.setItem(accessSessionKey, "1");
  document.body.classList.remove("auth-locked");
  authGate.hidden = true;
  appShell.hidden = false;
}

function lockApp() {
  document.body.classList.add("auth-locked");
  authGate.hidden = false;
  appShell.hidden = true;
  authError.hidden = true;
  authPassword.value = "";
  setTimeout(() => authPassword.focus(), 0);
}

function initializeAccess() {
  if (sessionStorage.getItem(accessSessionKey) === "1") {
    unlockApp();
    return;
  }

  lockApp();
}

guideBtn.addEventListener("click", openGuide);
guideCloseBtn.addEventListener("click", closeGuide);
guideModal.addEventListener("click", (event) => {
  if (event.target === guideModal) closeGuide();
});
imageButtonsBtn.addEventListener("click", openImageButtons);
imageButtonsCloseBtn.addEventListener("click", closeImageButtons);
imageButtonsModal.addEventListener("click", (event) => {
  if (event.target === imageButtonsModal) closeImageButtons();
});
reloadSharedImageButtonsBtn.addEventListener("click", () => {
  loadSharedImageButtons();
});
saveSharedImageButtonsBtn.addEventListener("click", () => {
  saveSharedImageButtons();
});
imageScopeTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-image-scope]");
  if (!tab) return;

  syncVisibleImageButtonRows();
  activeImageButtonScope = tab.dataset.imageScope;
  renderImageButtonTable();
});
imageButtonRowsBody.addEventListener("click", (event) => {
  const groupRemove = event.target.closest("[data-image-remove-group]");
  if (groupRemove) {
    removeImageButtonGroup(groupRemove.dataset.imageRemoveGroup);
    return;
  }

  const remove = event.target.closest("[data-image-remove]");
  if (!remove) return;
  syncVisibleImageButtonRows({ removeIndex: Number(remove.dataset.imageRemove) });
  persistImageButtonRows();
  renderImageButtonTable();
  renderCurrentNotification();
  setSharedImageButtonsStatus("Строка удалена локально. Чтобы удалить ее для всех, нажмите «Сохранить в общий».", "muted");
});
addImageButtonRowBtn.addEventListener("click", () => {
  syncVisibleImageButtonRows();
  imageButtonRows.push(normalizeImageButtonRow({ scope: activeImageButtonScope, language: "", text: "", group: "", green: "", white: "", width: 319, height: 40 }));
  renderImageButtonTable();
});
saveImageButtonsBtn.addEventListener("click", () => {
  syncVisibleImageButtonRows({ prune: true });
  persistImageButtonRows();
  renderImageButtonTable();
  renderCurrentNotification();
});
resetImageButtonsBtn.addEventListener("click", () => {
  imageButtonRows = defaultImageButtonRows.map(normalizeImageButtonRow);
  persistImageButtonRows();
  renderImageButtonTable();
  renderCurrentNotification();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !guideModal.hidden) closeGuide();
  if (event.key === "Escape" && !imageButtonsModal.hidden) closeImageButtons();
});
authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (authPassword.value === accessPassword) {
    unlockApp();
    return;
  }

  authError.hidden = false;
  authPassword.select();
});

convertBtn.addEventListener("click", convert);
sourceText.addEventListener("paste", (event) => {
  const html = event.clipboardData?.getData("text/html");
  if (!html) return;

  const markedText = htmlPasteToPlainText(html);
  if (!markedText.trim()) return;

  event.preventDefault();
  const start = sourceText.selectionStart;
  const end = sourceText.selectionEnd;
  sourceText.setRangeText(markedText, start, end, "end");
  if (autoConvert.checked) convert();
});
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});
["dragleave", "dragend", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.remove("drag-over");
  });
});
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();

  const file = event.dataTransfer?.files?.[0];
  if (file) {
    readDroppedFile(file).catch((error) => {
      window.alert(`Не удалось прочитать файл: ${error.message}`);
    });
    return;
  }

  const html = event.dataTransfer?.getData("text/html");
  const text = html ? htmlPasteToPlainText(html) : event.dataTransfer?.getData("text/plain");
  if (text) appendSourceText(text);
});
sourceText.addEventListener("input", () => {
  if (autoConvert.checked) convert();
});
keepLists.addEventListener("change", convert);
keepTables.addEventListener("change", convert);
Object.values(outputs).forEach((output) => {
  output.addEventListener("input", updatePreview);
});

sourceText.value = "Вот сюда добавьте какой-то текст, вы же не просто так сюда пришли";
convert();
initializeAccess();
loadSharedImageButtons({ silent: true });
