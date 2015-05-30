// ==UserScript==
// @name       		LeekWars AdvancedTooltips V2
// @version			0.0.1
// @author			yLark, asmodai27, artorias
// @description		Affiche une info-bulle au survol d'un lien pointant vers la page d'un poireau, d'un éleveur ou d'un rapport de combat
// @match      		http://beta.leekwars.com/*
// @grant			none
// @require			https://code.jquery.com/jquery-2.1.1.min.js
// @require			https://raw.githubusercontent.com/websanova/mousestop/master/mousestop.min.js
// ==/UserScript==

// Initialisation des paramètres d'affichage des tooltips

// Méthode d'affichage des tooltips
var display_method = 'mousestop'; //GM_getValue('advanced_tooltips_display_method', 'mousestop');

// Délais d'affichage des tooltips
var delay_before_display = 250; //GM_getValue('advanced_tooltips_delay_before_display', 250);

// Contrôle qu'on a bien un entier positif
if (isNaN(delay_before_display) || delay_before_display < 0) delay_before_display = 250;

// Afficher ou non le tableau des poireaux d'un éleveur
var display_farmer_leek_table = 1; //GM_getValue('advanced_tooltips_display_farmer_leek_table', 1);

// Sera incrémenté à chaque affichage de tooltip. Permet de toujours avoir le dernier tooltip au-dessus des précédents
var z_index = 1000;

// Création du div qui va accueillir tous les tooltips générés par le script
var hover_tooltip = $('<div/>').attr('id', 'hover_tooltip');

$(document).ready(function() {
	LW.on('pageload', function() {
		$(document.body).append(hover_tooltip);
		// Appel initial, au lancement du script
		set_event_listeners();
	});
});

// Recalcul des éléments à surveiller
function set_event_listeners() {

	// Élément à matcher : les liens et les div de class leek ou farmer
	var $element = $('a, div.leek, div.farmer');

	$element.unbind('mousestop');
	$element.unbind('mouseenter mouseleave');
	$element.hover( // Au survol de l'élément
		function() { // hover, mouse in
			var target = match_test(this);
			if (target != null) {
				var id = 'hover_tooltip_' + target.type + target.id;
				var tooltip = document.getElementById(id);
				// Si le tooltip a déjà été créé et qu'il est affiché, on stop l'animation et on l'affiche. Permet d'annuler le fadeOut si on survole le lien après avoir survolé le tooltip
				if (tooltip != null && tooltip.style.display != 'none') {
					$('#' + id).stop().show().css('opacity', 1);
				}
			}
		},
		function() { // hover, mouse out
			var target = match_test(this);
			if (target != null) {
				// Masque le tooltip
				$('#hover_tooltip_' + target.type + target.id).stop().fadeOut('fast');
			}
		}
	);

	if (display_method == 'mousestop') {
		// Si l'utilisateur a choisi la méthode mouse stop

		// Affiche ou créé le tooltip que quand la souris s'arrête de bouger sur l'élément. Ça permet d'éviter des appels ajax et affichages intempestifs lors d'un survol malheureux. mousestop est un event perso en @require dans le header du script
		$element.mousestop(delay_before_display,
			function() {
				var target = match_test(this);
				if (target != null) {
					display_tooltip(target);
				}
			}
		);
	} else {
		// Si l'utilisateur a choisi la méthode mouse over

		var timer;
		$element.hover(
			function() {
				var target = match_test(this);
				// On définit le timeout avec la valeur spécifiée par l'utilisateur
				timer = setTimeout(function() {
					if (target != null) {
						display_tooltip(target);
					}
				}, delay_before_display);
			},
			function() {
				// Si on sort de l'élément avant la fin du timeout, on annule l'affichage du tooltip
				clearTimeout(timer);
			}
		);
	}

	/* 	$element.bind('destroyed', function() {
			$('#hover_tooltip').children().hide();
		}); */
}

// Contrôle que l'élément survolé est bien susceptible d'affiche un tooltip
function match_test(self) {
	// Exclusion des liens contenus dans le menu et dans les tabs. Évite de spammer des tooltips
	if (!/menu|menu-wrapper|menu-button|tabs/i.test(self.parentNode.id) &&
	 		!/menu|menu-wrapper|menu-button|tabs/i.test(self.parentNode.parentNode.id)) {

		// Cas d'un div de class leek|farmer
		if (!isNaN(self.id) && self.id != '' && /(leek|farmer)/i.test(self.className)) {
			return {
				type: RegExp.$1,
				id: self.id
			};
		}

		// Cas d'un lien href vers une page leek|fight|report|farmer
		if (/^http:\/\/beta.leekwars.com\/(leek|fight|report|farmer)\/([0-9]+)$/i.test(self.href)) {
			var link_type = ((RegExp.$1 == 'fight') ? 'report' : RegExp.$1);
			return {
				type: link_type,
				id: RegExp.$2
			};
		}

		// Cas d'un lien xlink:href vers une page leek|fight|report|farmer
		if (/^(?:http:\/\/beta.leekwars.com)?\/(leek|fight|report|farmer)\/([0-9]+)$/i.test(self.getAttributeNS("http://www.w3.org/1999/xlink", "href"))) {
			var link_type = ((RegExp.$1 == 'fight') ? 'report' : RegExp.$1);
			return {
				type: link_type,
				id: RegExp.$2
			};
		}

		// Pages à prendre en charge dans les regex par la suite : |team|tournament|forum
	}
}

// Créé le tooltip s'il n'a pas encore été créé. S'il a déjà été créé, l'affiche.
function display_tooltip(target) {

	// Génère l'id du tooltip
	var id = 'hover_tooltip_' + target.type + target.id;
	var tooltip = document.getElementById(id);
	// Récupère la hauteur de la page web. source : http://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
	var document_height = Math.max(document.body.scrollHeight, document.body.offsetHeight,
		 document.documentElement.clientHeight, document.documentElement.scrollHeight,
		 document.documentElement.offsetHeight);
	var posX = mouse.x;
	var posY = mouse.y;


	// Si le tooltip contenant l'info sur le leek/farmer/team n'a pas encore été créé, on le créé
	if (tooltip === null) {
		tooltip = document.createElement('div');
		tooltip.id = id;
		tooltip.className = 'hover_tooltip';
		tooltip.innerHTML = '<img src="http://static.leekwars.com/image/loader.gif" alt="" style="display:block;margin:auto;">';
		hover_tooltip.append($(tooltip));

		var url = 'http://beta.leekwars.com/api/' + target.type + '/get/' + target.id;

		// Récupère le contenu de la page cible via ajax
		$.get(url, function(data) {
			// Récupère la page cible du lien

			// Supprime le gif de chargement
			tooltip.innerHTML = null;

			// Si le lien pointe vers une page de rapport de combat, on rempli le tooltip des données du rapport
			if (target.type === 'report') fill_report(tooltip, target, $data);

			// Si le lien pointe vers une page de poireau, on rempli le tooltip des données poireau
			if (target.type === 'leek') fill_leek(tooltip, target, data);

			// Si le lien pointe vers une page d'éleveur, on rempli le tooltip des données de l'éleveur
			if (target.type === 'farmer') {
				fill_farmer(tooltip, target, $data);
				// Fonction pour défier le farmer. Source : http://static.leekwars.com/script/farmer.js
				$('#challenge_farmer_' + target.id)[0].onclick = (function() {
					var farmer = /([0-9]+)/.exec($(this).attr('id'))[0];
					var form = $('<form>', {
						'method': 'post',
						'action': '/garden_update'
					});
					form.append($('<input>', {
						'name': 'challenge_farmer',
						'value': '' + farmer,
						'type': 'hidden'
					}));
					form.append($('<input>', {
						'name': 'token',
						'value': unsafeWindow.__TOKEN,
						'type': 'hidden'
					}));
					$("body").append(form);
					form.submit();
				});
			}

			// Si le lien pointe vers une page de team, on rempli le tooltip des données team
			if (target.type === 'team') fill_team(tooltip, target, $data);

			// Supprime les div de class .tooltip, qui sont inutiles et provoquent des erreurs d'affichage
			$('#hover_tooltip .tooltip').remove();

			// Repositionne le tooltip vu ses nouvelles dimensions
			position_tooltip(tooltip, document_height, posX, posY);
		}, "json");



		// Créé un handler pour garder le tooltip affiché quand il est survolé
		$('#' + id).unbind('mouseover');
		$('#' + id).bind('mouseover', function() {
			$(this).stop().show().css('opacity', 1);
		});
		// Créé un handler pour masquer le tooltip quand il n'est plus survolé
		$('#' + id).unbind('mouseout');
		$('#' + id).bind('mouseout', function() {
			$(this).stop().fadeOut('fast');
		});
	}

	if (tooltip.style.display != 'block') {
		// Si le tooltip vient d'être initialisé, ou s'il était masqué
		console.log("display");

		// On l'affiche
		tooltip.style.display = 'block';

		// On affiche tooltip au-dessus des éventuels autres, et on incrémente le compteur
		tooltip.style.zIndex = ++z_index;

		// On place le tooltip dans la page
		position_tooltip(tooltip, document_height, posX, posY);
	}
}


// Défini la position du tooltip en fonction de sa taille et des contraintes des bordures de la page
function position_tooltip(tooltip, document_height, posX, posY) {
	// On redéfini la position x à zéro pour corriger un problème d'affichage avec les rapports de combats
	//tooltip.style.left = '0px';

	// Calcul la nouvelle position en x
	posX = posX - tooltip.offsetWidth / 2;

	// Calcul la nouvelle position en y
	posY = posY + 17;

	// Si on dépasse à gauche
	if (posX < 10) posX = 10;

	// Si on dépasse à droite
	if (posX + tooltip.offsetWidth / 2 > window.innerWidth)
		posX = window.innerWidth - tooltip.offsetWidth / 2;

	// Si on dépasse en bas de la page
	if (posY + tooltip.offsetHeight > document_height)
		posY += -tooltip.offsetHeight - 30;

	// On (re)défini la position x
	tooltip.style.left = posX + 'px';

	// On (re)défini la position y
	tooltip.style.top = posY + 'px';
}


// Suivi de la position de la souris
var mouse = {
	x: 0,
	y: 0
};
document.addEventListener('mousemove', function(e) {
	mouse.x = e.pageX;
	mouse.y = e.pageY
}, false);


/* // Special jQuery event for element removal : http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom/10172676#10172676
(function($){
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery) */

///////////////////////// Suivi des modifications du DOM /////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// Code copied from here: http://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
var observeDOM = (function() {
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
		eventListenerSupported = window.addEventListener;

	return function(obj, callback) {
		if (MutationObserver) {
			// define a new observer
			var obs = new MutationObserver(function() {
				callback();
			});
			// have the observer observe foo for changes in children
			obs.observe(obj, {
				childList: true,
				subtree: true
			});
		} else if (eventListenerSupported) {
			obj.addEventListener('DOMNodeInserted', callback, false);
			obj.addEventListener('DOMNodeRemoved', callback, false);
		}
	}
})();

// Observe a DOM element
observeDOM(document.body, function() {
	// Si le DOM a changé, on relance l'écoute des évènements du script
	set_event_listeners();
});


///////////////////////// Création du contenu des tooltips /////////////////////////
////////////////////////////////////////////////////////////////////////////////////

var img = {
	1:'shock',
	2:'ice',
	3:'bandage',
	4:'cure',
	5:'flame',
	6:'flash',
	7:'rock',
	8:'protein',
	9:'stretching',
	10:'drip',
	11:'vaccine',
	12:'winged_boots',
	13:'seven_league_boots',
	14:'leather_boots',
	15:'motivation',
	16:'adrenaline',
	17:'rage',
	18:'spark',
	19:'pebble',
	20:'shield',
	21:'helmet',
	22:'armor',
	23:'wall',
	24:'rampart',
	25:'steroid',
	26:'doping',
	27:'warm_up',
	28:'reflexes',
	29:'fortress',
	30:'stalactite',
	31:'iceberg',
	32:'rockfall',
	33:'lightning',
	34:'liberation',
	35:'regeneration',
	36:'meteorite',
	37:'pistol',
	38:'machine_gun',
	39:'double_gun',
	40:'destroyer',
	41:'shotgun',
	42:'laser',
	43:'grenade_launcher',
	44:'electrisor',
	45:'magnum',
	46:'flame_thrower',
	47:'m_laser',
	48:'gazor',
	59:'teleportation',
	60:'b_laser',
	67:'armoring',
	68:'inversion',
	73:'puny_bulb',
	74:'fire_bulb',
	75:'healer_bulb',
	76:'rocky_bulb',
	77:'iced_bulb',
	78:'lightning_bulb',
	79:'metallic_bulb',
	80:'remission',
	81:'carapace',
	84:'resurrection',
	85:'devil_strike'
};

// Créé le contenu du tooltip leek
function fill_leek(tooltip, target, $data) {

	// Si le poireau n'existe pas ou est en erreur, on supprime le div
	if ($data.success == false) {
		tooltip.parentNode.removeChild(tooltip);
		return;
	}

	// Ajout du nom du poireau
	var leek = document.createElement('div');
	leek.setAttribute('style', 'float: left; font-weight: bold; font-size: 17px;');
	var leek_name = $data.leek.name;
	leek.innerHTML = '<a title="Défier ' + leek_name + '" href="/garden/challenge=' + target.id + '">' + leek_name
		+ '</a>';
	leek.className = 'AT_tooltip_name';
	tooltip.appendChild(leek);

	// Ajout de l'éleveur
	var farmer = document.createElement('div');
	farmer.setAttribute('style', 'text-align: right; margin-bottom: 6px;');
	farmer.innerHTML = '<a title="Éleveur" href="' + $data.leek.farmer.id + '">' + $data.leek.farmer.name + '</a>';
	farmer.className = 'AT_tooltip_subname';
	tooltip.appendChild(farmer);

	// Ajout du conteneur de level + talent + ratio
	var AT_basic = document.createElement('div');
	AT_basic.setAttribute('style', 'column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;');
	AT_basic.className = 'AT_basic';
	tooltip.appendChild(AT_basic);

	// Ajout du level
	var level = document.createElement('div');
	level.className = 'hover_level';
	level.innerHTML = 'Niveau ' + $data.leek.level;
	AT_basic.appendChild(level);

	// Ajout du talent
	var talent = document.createElement('div');
	talent.setAttribute('style', 'color:#555;');
	if ($data.leek.talent != '') { // Si le poireau a un talent
		talent.innerHTML += '<img src="http://static.leekwars.com/image/talent.png"/>';
		talent.innerHTML += $data.leek.talent;
		talent.title = 'Talent';
	} else {
		talent.innerHTML += '-';
	}
	talent.className = 'hover_talent';
	AT_basic.appendChild(talent);

	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = 'Ratio ' + $data.leek.ratio;
	ratio.className = 'ratio';
	AT_basic.appendChild(ratio);

	// Ajout des statistiques du poireau
	var stats = document.createElement('div');
	stats.className = 'hover_stats';
	stats.innerHTML += '<div style="color:red;" title="Points de vie">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/life.png"/>'
		+ $data.leek.life + '</div>';
	stats.innerHTML += '<div style="color:#b800b6;"  title="Fréquence">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/frequency.png"/>'
		+ $data.leek.frequency + '</div>';
	stats.innerHTML += '<div style="color:#833100;"  title="Force">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/strength.png"/>'
		+ $data.leek.strength + '</div>';
	stats.innerHTML += '<div style="color:#FF7F01;"  title="Points de tour">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/tp.png"/>'
		+ $data.leek.tp + '</div>';
	stats.innerHTML += '<div style="color:#0080F7;"  title="Agilité">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/agility.png"/>'
		+ $data.leek.agility + '</div>';
	stats.innerHTML += '<div style="color:#00A900;"  title="Points de mouvement">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/mp.png"/>'
		+ $data.leek.mp + '</div>';
	stats.innerHTML += '<div style="color:black;"  title="Sagesse">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/wisdom.png"/>'
		+ $data.leek.wisdom + '</div>';
	stats.innerHTML += '<div style="color:#0000a2;"  title="Cœurs">'
		+ '<img src="http://static.beta.leekwars.com/image/carac/cores.png"/>'
		+ $data.leek.cores + '</div>';
	stats.innerHTML = stats.innerHTML.replace(/id=/g, 'class=');
	tooltip.appendChild(stats);

	// Ajout des armes
	var weapons = document.createElement('div');

	weapons.setAttribute('style', 'display: inline-block;vertical-align: top;');

	for (var i = 0; i < $data.leek.weapons.length; i++) {
		var w = $data.leek.weapons[i].template;
		weapons.innerHTML += '<div style="margin: 4px;display: block;">'
			+ '<img src="http://static.beta.leekwars.com/image/weapon/' + img[w]
			+ '.png"/></div>';
	}
	weapons.className = 'leek-weapons';
	tooltip.appendChild(weapons);


	// Ajout des puces
	var chips = document.createElement('div');

	chips.setAttribute('style', 'display: inline-block;vertical-align: bottom;width: 190px;');

	for (var i = 0; i < $data.leek.chips.length; i++) {
		var c = $data.leek.chips[i].template;
		chips.innerHTML += '<div style="display: inline-block; vertical-align: bottom; margin: 4px;">'
			+ '<img style="width: 55px;vertical-align: bottom;" src="http://static.beta.leekwars.com/image/chip/'
			+ img[c] + '.png"/></div>';
	}
	chips.className = 'leek-chips';
	tooltip.appendChild(chips);
}

// Créé le contenu du tooltip report
function fill_report(tooltip, target, $data) {

	// Si le combat n'est pas encore généré ou en erreur, on supprime le div
	if ($data.find('#page h1:contains("404")').length != 0) {
		tooltip.parentNode.removeChild(tooltip);
		return;
	}

	tooltip.innerHTML += '<a class="tiny_fight_link" href="http://beta.leekwars.com/fight/' + target.id + '" title="Combat"><img src="http://static.leekwars.com/image/garden.png"></a>';
	tooltip.innerHTML += '<a class="tiny_fight_link" href="http://beta.leekwars.com/report/' + target.id + '" title="Rapport de combat"><img src="http://static.leekwars.com/image/forum.png"></a>';

	// S'il y a trop de poireaux, on affiche les tableaux de chaque équipe côte à côte
	if ($data.find('.name').length > 10) {
		$('<div class="teams_block"></div>').insertBefore($data.find('h3').eq(0));
		$('<div class="team_table"></div><div class="team_table"></div>').appendTo($data.find('.teams_block'));
		$($data.find('h3').eq(0)).appendTo($data.find('.team_table').eq(0));
		$($data.find('h3').eq(1)).appendTo($data.find('.team_table').eq(1));

		var nb_report = $data.find('.report').length;
		for (var report_id = 0; report_id < nb_report; report_id++)
			$($data.find('.report').eq(report_id)).appendTo($data.find('.team_table').eq(Math.round((report_id + 1) / nb_report * 2) - 1));
	}

	$data.find('.bar').remove();
	$data.find('#duration').addClass('duration');
	$data.find('.name').removeClass('name').addClass('hover_name');
	$data.find('.money').removeClass('money').addClass('hover_money');
	$data.find('.talent').removeClass('talent').addClass('hover_fight_talent');
	$data.find('.level').removeClass('level');

	// Nettoie les id pour ne pas avoir de conflit
	tooltip.innerHTML += $data.find('#report-general').html().replace(/id=/g, 'old_id=');
}

// Créé le contenu du tooltip farmer
function fill_farmer(tooltip, target, $data) {

	// Ajout de l'avatar de l'éleveur
	var avatar = document.createElement('div');
	avatar.className = 'AT_avatar';
	avatar.innerHTML = '<a title="Éleveur" href="http://beta.leekwars.com/farmer/' + target.id + '"><img src="' + $data.find('#avatar').attr('src') + '"></a>';
	tooltip.appendChild(avatar);

	// Ajout du nom de l'éleveur
	var farmer = document.createElement('div');
	var farmer_name = $data.find('#page h1').text();

	 // Est-ce que l'éleveur est connecté ?
	var connexion_state = 'state ' + $data.find('#page h1 span').attr('class');

	farmer.innerHTML = '<a title="Défier ' + farmer_name + '" id="challenge_farmer_' + target.id + '">' + farmer_name + '</a><span class="' + connexion_state + '"></span>';
	farmer.className = 'AT_tooltip_name';
	tooltip.appendChild(farmer);

	// Si l'éleveur n'existe plus, on ne continue pas le tooltip
	if (farmer_name == 'Éleveur supprimé') return;

	// Ajout de l'équipe
	var team = document.createElement('div');
	team.className = 'AT_tooltip_subname';
	team.innerHTML = '<a title="Équipe" href="' + $data.find('#team a').attr('href') + '">' + $data.find('#team').text().trim() + '</a>';
	tooltip.appendChild(team);

	// Ajout du conteneur de talent + ratio + nb poireaux
	var AT_basic = document.createElement('div');
	AT_basic.className = 'AT_basic';
	tooltip.appendChild(AT_basic);

	// Ajout d'un lien pour envoyer un message
	var send_message = document.createElement('div');
	send_message.className = 'AT_send_message';
	send_message.innerHTML = '<a title="Envoyer un message à ' + farmer_name + '" href="http://beta.leekwars.com/messages/new/' + target.id + '"><img src="http://static.leekwars.com/image/messages.png" alt="Envoyer un message"></a>';
	AT_basic.appendChild(send_message);

	// Ajout du talent
	var talent = document.createElement('div');
	if ($data.find("#talent").text() != '') {
		// Si le poireau a un talent
		talent.innerHTML += '<img src="http://static.leekwars.com/image/talent.png">';
		talent.innerHTML += $data.find("#talent").text();
		talent.title = 'Talent';
	} else {
		talent.innerHTML += '-';
	}
	talent.className = 'hover_talent';
	AT_basic.appendChild(talent);

	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = $data.find("#tt_fights").text();
	ratio.className = 'ratio';
	AT_basic.appendChild(ratio);

	/* //Ajout du nombre de poireaux
	var leeks_count = document.createElement('div') ;
	leeks_count.innerHTML = $data.find('.leek').length + ' Poireau' + (($data.find('.leek').length>1)?'x':'');
	leeks_count.className = 'ratio';
	AT_basic.appendChild(leeks_count); */

	//ajout du tableau au tooltip
	if (display_farmer_leek_table == 1) { // Si l'option a été cochée dans les paramètres, on affiche

		tooltip.innerHTML += '<table id="leeks_table_' + target.id + '" class="hover_leeks_table"><tbody><tr><th>Poireau</th><th>Niveau</th><th>Ratio</th>\
		   <th><img src="http://static.leekwars.com/image/talent.png" alt="Talent" title="Talent"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_life.png" alt="Points de vie" title="Points de vie"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_strength.png" alt="Force" title="Force"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_agility.png" alt="Agilit&eacute;" title="Agilit&eacute;"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_widsom.png" alt="Sagesse" title="Sagesse"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_frequency.png" alt="Fr&eacute;quence" title="Fr&eacute;quence"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_tp.png" alt="Points de tour" title="Points de tour"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_mp.png" alt="Points de mouvement" title="Points de mouvement"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_cores.png" alt="C&oelig;urs" title="C&oelig;urs"></img></th>\
		</tr></tbody></table>';

		var leek_no = 0,
			avgLevel = 0,
			avgRatio = 0,
			avgTalent = 0,
			avgLife = 0,
			avgForce = 0,
			avgAgility = 0,
			avgWisdom = 0,
			avgFreq = 0,
			avgTP = 0,
			avgMP = 0,
			avgCores = 0;

		// Extraction des caractéristiques des leeks
		$data.find('.leek').each(function() {
			var id = $(this).attr('id');
			var name = /(\w+)/.exec($(this).text())[1]; //
			var level = /([0-9]+)$/.exec($('span.level', $(this)).first().text())[1];
			var talent = '' + $('div.talent', $(this)).first().text();
			if (talent == '') talent = '-';

			// Prépare la ligne de chaque poireau. Permet de les garder toujours triés, même si les requêtes ajax arrivent dans le désordre
			$('#leeks_table_' + target.id).append($('<tr id="farmer_leek_table_' + id + '"></tr>'));

			// Récupère les données du poireau
			$.post('http://beta.leekwars.com/leek/' + id, function(leekdata) {
				var $leekdata = $(leekdata);
				var ratio = /([0-9]+\.[0-9]+)/.exec($leekdata.find("#tt_fights").text())[1];
				var life = $leekdata.find('#lifespan').text();
				var force = $leekdata.find('#strengthspan').text();
				var agility = $leekdata.find('#agilityspan').text();
				var wisdom = $leekdata.find('#widsomspan').text();
				var frequency = $leekdata.find('#frequencyspan').text();
				var tp = $leekdata.find('#tpspan').text();
				var mp = $leekdata.find('#mpspan').text();
				var cores = $leekdata.find('#coresspan').text();

				$('#farmer_leek_table_' + id).append($('<td><a href="/leek/' + id + '">' + name + '</td>\
					<td>' + level + '</td><td>' + ratio + '</td><td>' + talent + '</td><td>' + life + '</td>\
					<td>' + force + '</td><td>' + agility + '</td><td>' + wisdom + '</td><td>' + frequency + '</td>\
					<td>' + tp + '</td><td>' + mp + '</td><td>' + cores + '</td>'));

				leek_no++;
				avgLevel = (avgLevel * (leek_no - 1) + Math.floor(level)) / leek_no;
				avgRatio = (avgRatio * (leek_no - 1) + Math.floor(ratio * 100) / 100) / leek_no;
				if (talent != '-')
					avgTalent = (avgTalent * (leek_no - 1) + Math.floor(talent)) / leek_no;
				avgLife = (avgLife * (leek_no - 1) + Math.floor(life)) / leek_no;
				avgForce = (avgForce * (leek_no - 1) + Math.floor(force)) / leek_no;
				avgAgility = (avgAgility * (leek_no - 1) + Math.floor(agility)) / leek_no;
				avgWisdom = (avgWisdom * (leek_no - 1) + Math.floor(wisdom)) / leek_no;
				avgFreq = (avgFreq * (leek_no - 1) + Math.floor(frequency)) / leek_no;
				avgTP = (avgTP * (leek_no - 1) + Math.floor(tp)) / leek_no;
				avgMP = (avgMP * (leek_no - 1) + Math.floor(mp)) / leek_no;
				avgCores = (avgCores * (leek_no - 1) + Math.floor(cores)) / leek_no;

				$('#leeks_table_' + target.id + ' td#avg_level').html(Math.floor(avgLevel));
				$('#leeks_table_' + target.id + ' td#avg_ratio').html(Math.floor(avgRatio * 100) / 100);
				$('#leeks_table_' + target.id + ' td#avg_talent').html(Math.floor(avgTalent));
				$('#leeks_table_' + target.id + ' td#avg_life').html(Math.floor(avgLife));
				$('#leeks_table_' + target.id + ' td#avg_force').html(Math.floor(avgForce));
				$('#leeks_table_' + target.id + ' td#avg_agility').html(Math.floor(avgAgility));
				$('#leeks_table_' + target.id + ' td#avg_wisdom').html(Math.floor(avgWisdom));
				$('#leeks_table_' + target.id + ' td#avg_freq').html(Math.floor(avgFreq));
				$('#leeks_table_' + target.id + ' td#avg_tp').html(Math.floor(avgTP * 10) / 10);
				$('#leeks_table_' + target.id + ' td#avg_mp').html(Math.floor(avgMP * 10) / 10);
				$('#leeks_table_' + target.id + ' td#avg_cores').html(Math.floor(avgCores * 10) / 10);

			});
		});

		// Ajout d'une ligne de sommes / moyennes
		$('#leeks_table_' + target.id).append($('<tr class="total"><td>Moyennes</td><td id="avg_level">0</td><td id="avg_ratio">0</td><td id="avg_talent">0</td>\
<td id="avg_life">0</td><td id="avg_force">0</td><td id="avg_agility">0</td><td id="avg_wisdom">0</td><td id="avg_freq">0</td><td id="avg_tp">0</td><td id="avg_mp">0</td>\
<td id="avg_cores">0</td></tr>'));
	}
}

// Créé le contenu du tooltip team
function fill_team(tooltip, target, $data) {

}

// Insertion et gestion des paramètres d'affichage du tooltip
if (document.URL == 'http://beta.leekwars.com/settings') {

	// Insertion du code html dans le DOM
	var tooltips_settings = document.createElement('div');
	tooltips_settings.id = 'advanced_tooltips_settings';
	tooltips_settings.innerHTML = '\
		<h2>AdvancedTooltips</h2><br>\
		<h3>Méthode d\'affichage des info-bulles</h3>\
		<form id="advanced_tooltips_display_method">\
			<input ' + ((display_method == 'mouseover') ? 'checked ' : ' ') + 'type="radio" name="advanced_tooltips_display_method" id="advanced_tooltips_display_method_mouseover" value="mouseover"><label for="advanced_tooltips_display_method_mouseover">Au survol de l\'élément</label><br>\
			<input ' + ((display_method == 'mousestop') ? 'checked ' : ' ') + 'type="radio" name="advanced_tooltips_display_method" id="advanced_tooltips_display_method_mousestop" value="mousestop"><label for="advanced_tooltips_display_method_mousestop">À l\'arrêt de la souris sur l\'élément</label>\
		</form>\
		<br><h3>Délais avant affichage (ms)</h3>\
		<input id="advanced_tooltips_delay_before_display" type="text" value="' + delay_before_display + '"></input>\
		<br><br><h3>Info-bulle d\'éleveur</h3>\
		<input ' + ((display_farmer_leek_table == 1) ? 'checked ' : ' ') + 'type="checkbox" name="advanced_tooltips_display_farmer_leek_table" id="advanced_tooltips_display_farmer_leek_table"><label for="advanced_tooltips_display_farmer_leek_table">Afficher le détail des poireaux de l\'éleveur</label><br>\
		<br><br><br>\
	';
	var settings_container = document.getElementById('settings-container');
	settings_container.insertBefore(tooltips_settings, settings_container.firstChild);

	// Listeners pour le suivi des modifications des paramètres
	$('input[name="advanced_tooltips_display_method"]').change(function() {
		display_method = $(this).val();
		GM_setValue('advanced_tooltips_display_method', display_method);
	});

	$('#advanced_tooltips_delay_before_display').change(function() {
		delay_before_display = parseInt($(this).val());
		GM_setValue('advanced_tooltips_delay_before_display', delay_before_display);
	});

	$('#advanced_tooltips_display_farmer_leek_table').change(function() {
		display_farmer_leek_table = $(this).is(':checked') ? 1 : 0;
		GM_setValue('advanced_tooltips_display_farmer_leek_table', display_farmer_leek_table);
	});
}
