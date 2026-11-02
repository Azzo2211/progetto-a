/*
 * Progetto A - Recupero: le dimostrazioni dell'omino per ogni esercizio, una riga per passo
 * (nello stesso ordine dei passi di recovery/data.js): [didascalia, movimento, movimento*N, ...].
 * I movimenti "rec." sono in defense/moves/recupero.js; si usano anche quelli comuni ("gen.")
 * e quelli della boxe e della muay thai per la tecnica. Copertura controllata da tests/recovery.test.js.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RecoveryDemos = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  return {
    /* estensione */
    "prono-appeso": [["A pancia in giù vicino al bordo del letto", "rec.proneLie"], ["Scivola indietro: rotula fuori dal materasso", "rec.proneScoot"], ["Gambe che pendono, muscoli rilassati", "rec.proneHang"], ["Per uscire piega prima la gamba sana", "rec.proneExit"]],
    "tallone-rialzo": [["Tallone sul rialzo, sotto il ginocchio aria", "rec.heelProp"], ["Punta del piede verso il soffitto", "rec.heelProp"], ["Lascia scendere il ginocchio, rilassato", "rec.heelRelax"], ["Contrai la coscia 10 secondi, poi rilassa", "rec.quadSet*2"]],
    "arco-corto": [["Rotolo sotto il ginocchio, l'altra gamba piegata", "rec.shortArcSet"], ["Piede verso di te, coscia contratta", "rec.shortArcSet"], ["Stendi il ginocchio fino a dritto", "rec.shortArc"], ["Tieni 3 secondi, poi giù in 2", "rec.shortArc"]],
    /* flessibilità per i calci */
    "femorali-rialzo": [["Tallone dell'operata sul rialzo, gamba tesa", "rec.hamSet"], ["Coscia contratta, punta del piede in alto", "rec.hamQuad"], ["Piega dalle anche con la schiena dritta", "rec.hamHinge"], ["Resta respirando, poi l'altra gamba", "rec.hamHold"]],
    "polpaccio-muro": [["Mani al muro, operata dietro di un passo", "rec.calfWallSet"], ["Tallone giù, ginocchio dietro dritto", "rec.calfWallQuad"], ["Bacino verso il muro: il polpaccio tira", "rec.calfWall"], ["Resta respirando, poi cambia gamba", "rec.calfWallSwitch"]],
    "gambe-muro-v": [["Sedere vicino al muro, gambe in alto", "rec.legsWall"], ["Ginocchia dritte, punte verso di te", "rec.legsWallQuad"], ["Le gambe scivolano in una V, piano", "rec.legsWallV"], ["Per uscire riavvicinale con le mani", "rec.legsWallClose"]],
    "estensione-attiva": [["Coscia dell'operata in verticale", "rec.akeSet"], ["Ginocchio a 90°, la coscia non si muove", "rec.akeHold90"], ["Stendi verso il soffitto più che puoi", "rec.akeExt"], ["Tieni 5 secondi, poi giù in 3", "rec.akeHold"]],
    "flessori-anca": [["Passo lungo, operata dietro e tesa", "rec.hfSet"], ["Ginocchio dietro dritto, davanti poco piegato", "rec.hfQuad"], ["Gluteo stretto, bacino avanti", "rec.hfPush"], ["Resta respirando, poi cambia gamba", "rec.hfArm"]],
    "slancio-frontale": [["Di fianco al muro, mano sul muro", "rec.olfSet"], ["Coscia contratta, punta tirata", "rec.olfQuad"], ["Su in 2 secondi a ginocchio dritto", "rec.olf"], ["Giù in 3 secondi, poi l'altra gamba", "rec.olfDown"]],
    "slancio-laterale": [["Di fronte al muro, mani appoggiate", "rec.olsSet"], ["Ginocchio dritto, punta in avanti", "rec.olsQuad"], ["Di lato in 2 secondi, busto dritto", "rec.ols"], ["Giù in 3 secondi, poi l'altra gamba", "rec.olsDown"]],
    "divaricata": [["Seduto a gambe aperte e dritte", "rec.strSit"], ["Ginocchia premute a terra, punte in alto", "rec.strQuad"], ["Piega in avanti dalle anche, al centro", "rec.strFwd"], ["Verso una gamba, poi verso l'altra", "rec.strSide"]],
    /* gambe */
    "slr": [["Sdraiato, gamba sana piegata", "rec.slrSet"], ["Gamba operata distesa e contratta", "rec.slrSet"], ["Su dritta fino al ginocchio piegato", "rec.slr"], ["Tieni 2 secondi e scendi lento", "rec.slr"]],
    "sedia": [["Sedia alta contro il muro, piedi indietro", "rec.chairSit"], ["Busto avanti, schiena dritta", "rec.chairLean"], ["Spingi il pavimento e alzati del tutto", "rec.chairStand"], ["Siediti in 3 secondi, senza cadere", "rec.chairDown"]],
    "muro": [["Schiena al muro, piedi a 40-50 cm", "rec.wallStand"], ["Scivola giù fino all'angolo del livello", "rec.wallSlide"], ["Ginocchia sopra le caviglie, peso uguale", "rec.wallHold"], ["Tieni, poi risali scivolando", "rec.wallUp"]],
    "ponte": [["Sdraiato, piedi a terra", "rec.bridgeSet"], ["Spingi con i talloni e solleva il bacino", "gen.bridge"], ["Tieni 2 secondi stringendo i glutei", "rec.bridgeHold"], ["Scendi in 2 secondi", "rec.bridgeDown"]],
    "polpacci": [["In piedi, una mano al muro", "rec.calfSet"], ["Sali sulle punte più in alto che puoi", "rec.calfUp"], ["Tieni 1 secondo in cima", "rec.calfHold"], ["Scendi in 3 secondi", "rec.calfDown"]],
    "abduzione": [["Sul fianco, gamba di sotto piegata", "rec.sideLie"], ["Punta del piede in avanti, non in alto", "rec.sideLie"], ["Solleva la gamba di sopra e tieni", "rec.sideAbd"], ["Scendi lento, poi l'altro lato", "rec.sideAbd"]],
    "equilibrio": [["In piedi vicino al muro", "rec.standWall"], ["Solleva la gamba sana, ginocchio morbido", "rec.oneLeg"], ["Bacino dritto, piede a tripode", "rec.oneLegHold"], ["Tieni il tempo, poi cambia gamba", "rec.oneLegSwitch"]],
    "step-up": [["Davanti a un gradino stabile", "rec.stepFront"], ["Piede dell'operata tutto sul gradino", "rec.stepFoot"], ["Sali stendendo del tutto il ginocchio", "rec.stepUp"], ["Scendi lento con la gamba sana", "rec.stepBack"]],
    "split-squat": [["Passo lungo, operata davanti", "rec.splitSet"], ["Scendi in verticale, busto dritto", "rec.splitDown"], ["Solo fin dove non hai dolore", "rec.splitHold"], ["Risali spingendo con il tallone", "rec.splitUp"]],
    "stacco-rumeno": [["Manubri davanti alle cosce", "rec.rdlStand"], ["Ginocchia sbloccate e ferme così", "rec.rdlSoft"], ["Sedere indietro, manubri lungo le gambe", "rec.rdlHinge"], ["Fino a metà tibia, poi risali", "rec.rdlUp"]],
    "estensione-seduto": [["Seduto in fondo alla sedia", "rec.seatSit"], ["Peso alla caviglia dell'operata", "rec.seatSit"], ["Stendi fino a dritto e tieni 2 secondi", "rec.seatExt"], ["Scendi in 3 secondi fino a 90 gradi", "rec.seatExtDown"]],
    "curl-scivolato": [["Talloni sull'asciugamano", "rec.slideSet"], ["Solleva il bacino come nel ponte", "rec.slideBridge"], ["Talloni avanti in 3 secondi, bacino su", "rec.slideOut"], ["Riporta i talloni piegando le ginocchia", "rec.slideIn"]],
    "step-down": [["Sul bordo del gradino con l'operata", "rec.sdStand"], ["L'altra gamba nel vuoto, dritta", "rec.sdStand"], ["Piega in 3 secondi: il tallone sfiora terra", "rec.sdLower"], ["Risali stendendo il ginocchio", "rec.sdUp"]],
    "stella": [["Sull'operata, mani sui fianchi", "rec.starSet"], ["Piega e tocca davanti, leggero", "rec.starFwd"], ["Diagonale dietro, fuori e dentro", "rec.starBack"], ["Le tre direzioni sono una ripetizione", "rec.starAll"]],
    "pogo": [["In piedi, sugli avampiedi", "rec.pogoSet"], ["Saltelli di pochi centimetri", "rec.pogo"], ["Contatto breve e silenzioso", "rec.pogo"], ["Fermati se perdi ritmo", "rec.pogoSet"]],
    "atterraggio": [["Su un gradino basso", "rec.landStand"], ["Scendi e atterra: anche e ginocchia insieme", "rec.landDrop"], ["Ginocchia sopra le punte, petto avanti", "rec.landHold"], ["Fermo 2 secondi, poi risali", "rec.landBack"]],
    "corsa": [["Camminata veloce per scaldarti", "gen.walk*2"], ["Corsa leggera: riesci a parlare", "gen.jog*2"], ["Passi corti e frequenti", "gen.jog*2"], ["Il giorno dopo: gonfiore ed estensione", "rec.heelProp"]],
    "agilita": [["Corsa a otto intorno a due oggetti", "gen.jog*2"], ["Passi laterali scivolati", "rec.shuffle*2"], ["Corsa, frenata in due tempi, ritorno", "gen.jog", "rec.brake"], ["Velocità del livello", "rec.shuffle", "rec.brake"]],
    "salto-una-gamba": [["Sull'operata, mani ai fianchi", "rec.oneLeg"], ["Saltello basso, atterraggio morbido", "rec.hopR"], ["Ginocchio sopra il piede", "rec.hopR"], ["Confronta con la gamba sana", "rec.oneLegSwitch"]],
    /* parte alta */
    "floor-press": [["Sdraiato a gambe distese", "rec.pressSet"], ["Manubri sopra il petto, polsi dritti", "rec.pressSet"], ["Gomiti a terra a 45 gradi", "rec.press"], ["Un attimo fermo e spingi in alto", "rec.press"]],
    "piegamenti": [["Mani poco più larghe delle spalle", "gen.plank"], ["Corpo dritto, gambe tese", "gen.plank"], ["Scendi in 2 secondi, gomiti a 45 gradi", "gen.pushup"], ["Spingi via il pavimento", "gen.pushup"]],
    "rematore": [["Mano sul tavolo, busto inclinato", "rec.rowSet"], ["Manubrio sotto la spalla", "rec.rowSet"], ["Tira il gomito verso il fianco", "rec.row"], ["Fermo un attimo, giù in 2 secondi", "rec.row"]],
    "rematore-tavolo": [["Prova il tavolo: pesante e fermo", "rec.invCheck"], ["Sotto il tavolo, mani al bordo", "rec.invSet"], ["Corpo dritto, tira il petto al bordo", "rec.invPull"], ["Scendi in 2 secondi a braccia tese", "rec.invPull"]],
    "lento": [["Seduto con lo schienale", "rec.ohpSet"], ["Manubri all'altezza delle spalle", "rec.ohpSet"], ["Spingi in alto senza inarcare", "rec.ohp"], ["Scendi fino al mento", "rec.ohp"]],
    "alzate-laterali": [["Manubri leggeri lungo i fianchi", "rec.latSet"], ["Su di lato fino alle spalle", "rec.lat"], ["Mignolo all'altezza del pollice", "rec.lat"], ["Scendi in 3 secondi", "rec.lat"]],
    "curl": [["Manubri lungo i fianchi", "rec.curlSet"], ["Piega i gomiti fino alle spalle", "rec.curl"], ["Stringi un attimo in alto", "rec.curl"], ["Scendi in 3 secondi", "rec.curl"]],
    "tricipiti": [["Seduto, manubrio sopra la testa", "rec.triSet"], ["Gomiti in alto e vicini alla testa", "rec.triSet"], ["Giù dietro la testa in 3 secondi", "rec.tri"], ["Stendi senza muovere i gomiti", "rec.tri"]],
    "pullover": [["Sdraiato, manubrio sopra il petto", "rec.pullSet"], ["Dietro la testa in 3 secondi", "rec.pull"], ["Senti allungare i dorsali", "rec.pull"], ["Riporta su tirando con i dorsali", "rec.pull"]],
    "ytw": [["A pancia in giù, fronte a terra", "rec.ytwRest"], ["Y: braccia a V, pollici in alto", "rec.ytwY"], ["T: braccia aperte di lato", "rec.ytwT"], ["W: scapole verso le tasche", "rec.ytwW"]],
    "contadino": [["Un manubrio per mano", "rec.farmerSet"], ["Spalle basse, busto alto", "rec.farmerSet"], ["Tallone, pianta, punta: ginocchio dritto", "rec.farmerWalk*2"], ["Gira a piccoli passi", "rec.farmerWalk"]],
    /* tronco */
    "dead-bug": [["Braccia in alto, anche e ginocchia a 90", "rec.dbSet"], ["Schiena bassa schiacciata a terra", "rec.dbSet"], ["Allunga braccio e gamba opposti", "rec.dbExt"], ["Torna al centro e cambia lato", "rec.dbExt"]],
    "plank-laterale": [["Sul fianco, gomito sotto la spalla", "rec.sideElbow"], ["Gambe tese, piedi uno sull'altro", "rec.sideElbow"], ["Solleva il bacino fino alla linea dritta", "rec.sidePlank"], ["Tieni respirando, poi l'altro lato", "rec.sidePlankHold"]],
    "hollow": [["Sdraiato, braccia lungo i fianchi", "rec.hollowSet"], ["Schiena bassa schiacciata a terra", "rec.hollowSet"], ["Spalle e gambe su di pochi centimetri", "rec.hollowUp"], ["Tieni respirando corto", "rec.hollowHold"]],
    /* tecnica */
    "shadow-seduto": [["Sul bordo della sedia, mani in guardia", "rec.seatGuard"], ["Colpi dal busto, ritorno in guardia", "rec.seatOneTwo"], ["Espira a ogni colpo", "rec.seatHooks"], ["Il compito del round: anche le schivate", "rec.seatSlip"]],
    "parate": [["Guardia, piedi fermi, ginocchia morbide", "boxe.guardHold"], ["Parata, blocco alto, gomito al corpo", "boxe.parry", "boxe.coverHook", "boxe.bodyBlock"], ["Schivata: si sposta solo il busto", "boxe.slipOut", "boxe.slipIn"], ["Dopo ogni difesa, una risposta", "boxe.parryJab", "boxe.slipCross"]],
    "shadow-fermo": [["Guardia, ginocchia morbide", "boxe.guardHold"], ["Diretto: il tallone dietro si alza e gira", "boxe.crossLegs", "boxe.cross"], ["Combinazione e ritorno in guardia", "boxe.onetwo", "boxe.guardHold"], ["Niente passi: busto, anche e braccia", "boxe.onetwothree"]],
    "calci-rallentatore": [["Di fianco al muro, sulla gamba sana", "rec.skSet"], ["Camera: ginocchio dell'operata su", "rec.skChamber"], ["Stendi in 3 secondi, tieni 2", "rec.skFront"], ["Dal livello 2 anche il laterale", "rec.skSide"]],
    "colpi-equilibrio": [["Vicino al muro, sull'operata", "rec.legGuard"], ["Colpi dritti lenti, poi più veloci", "rec.legJab"], ["Ginocchio d'appoggio sopra il piede", "rec.legJab"], ["Ginocchiata lenta e cambio gamba", "rec.legKnee"]],
    "passi-guardia": [["In guardia, sugli avampiedi", "boxe.guardHold"], ["Avanti: parte il piede davanti", "boxe.stepFwd*2"], ["Indietro: parte il piede dietro", "boxe.stepBack*2"], ["Un jab a ogni passo avanti", "boxe.jabStep*2"]],
    "shadow-movimento": [["Passi in guardia per scaldarti", "boxe.stepFwd", "boxe.stepBack"], ["Spostamenti e combinazioni", "boxe.box4", "boxe.onetwo"], ["Pivot sull'avampiede davanti", "boxe.pivot", "boxe.onetwothreePivot"], ["Chiudi con le difese", "boxe.slipOut", "boxe.parry", "boxe.cover"]],
    "corda": [["Corda della lunghezza giusta", "gen.stand"], ["Saltelli bassi a piedi uniti", "boxe.rope*2"], ["Atterraggio silenzioso sugli avampiedi", "boxe.rope"], ["Passo del pugile, piedi alternati", "boxe.ropeShuffle*2"]],
    "calci-lenti": [["Vicino al muro per l'equilibrio", "rec.standWall"], ["Teep lento all'altezza della coscia", "muaythai.teepLSlow"], ["Circolare basso: l'appoggio ruota", "muaythai.kickSlow"], ["Prima con la sana, poi con l'operata", "muaythai.teepRSlow"]],
    "sparring": [["Prima l'ok del chirurgo", "gen.stand"], ["Tecnico leggero: solo braccia", "boxe.bounce", "boxe.onetwo", "boxe.parryJab"], ["A tema: un compito per round", "boxe.slipCross", "boxe.rollHook"], ["Poi libero, la lotta per ultima", "boxe.comboA", "boxe.bounce"]]
  };
});
