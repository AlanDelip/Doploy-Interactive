import $ from 'jquery';
import axios from 'axios';
import 'bootstrap';
import 'popper.js';

let framework = 'flask', database = 'postgresql', os = 'centos', nodb = false;
$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip();
	$('.starter-item').click(function () {
		let $customize = $('.customize');
		let $template = $('.template');
		if ($(this).text().includes('Template')) {
			$template.show();
			$customize.hide();
		} else {
			$customize.show();
			$template.hide();
		}
	});

	// step forward
	let barHeight = $('.res-steps-container').parent().height();
	let steps = ['.res-step-zero', '.res-step-one', '.res-step-two', '.res-step-three', '.res-step-four'];
	let i = 1;
	$(".res-step-form .res-btn-orange").click(function () {
		let getClass = $(this).attr('data-class');
		$(".res-steps").removeClass('active');
		$(steps[i]).addClass('active');
		i++;
		if (getClass !== ".res-form-five") {
			let nextPanel = $(getClass).parent().next().next().next().children();
			$('main').height(barHeight + nextPanel.height());
			$(getClass).animate({
				left: '-150%'
			}, 500, function () {
				$(getClass).css('left', '-150%');
			});
			nextPanel.animate({
				left: '0%'
			}, 500, function () {
				$(this).css('display', 'block');
			});
		}
	});

	// step back
	$(".res-step-form .res-btn-gray").click(function () {
		let getClass = $(this).attr('data-class');
		let previousPanel = $(getClass).parent().prev().prev().prev().children();
		$(".res-steps").removeClass('active');
		i--;
		$(steps[i - 1]).addClass('active');
		$('main').height(barHeight + previousPanel.height());
		$(getClass).prev().css('left', '-150%');
		$(getClass).animate({
			left: '150%'
		}, 500);
		previousPanel.animate({
			left: '0%'
		}, 500)
	});

	$('.has-database .delete-btn, .no-database .add-btn ').click(e => {
		e.stopPropagation();
		document.querySelectorAll('.has-database').forEach(e => e.toggleAttribute('hidden'));
		document.querySelectorAll('.no-database').forEach(e => e.toggleAttribute('hidden'));
		nodb = $(e.currentTarget).text().includes('x');
	});

	let $frameworkExpand = $('#framework-expand');
	let $databaseExpand = $('#database-expand');
	$frameworkExpand.click(function () {
		document.querySelector('.framework-config').toggleAttribute('detail-hide');
		$('.database-config').attr('detail-hide', '');
		$(this).children('img').toggleClass('img-inactive');
		$databaseExpand.children().eq(1).children('img').addClass('img-inactive');
	});

	$databaseExpand.click(function () {
		$('.framework-config').attr('detail-hide', '');
		document.querySelector('.database-config').toggleAttribute('detail-hide');
		$(this).children().eq(1).children('img').toggleClass('img-inactive');
		$frameworkExpand.children('img').addClass('img-inactive');
	});

	$('.copy').click(() => {
		let $noti = $('#notification');
		navigator.clipboard.writeText($('#deploy-key').val())
			.then(() => {
				$noti.html('<div class="notification success">Copied!</div>');
			}, () => {
				$noti.html('<div class="notification fail">Copy failed, please copy manually.</div>');
			});
	})
});

export function updateFramework(e) {
	let frameworks = ["flask", "springboot", "express"];
	let display = ["Flask(Python)", "Springboot(Java)", "Express(NodeJS)"];
	framework = e.value;
	let index = frameworks.indexOf(framework);
	$('#selected-framework').text(display[index]);
	frameworks.splice(frameworks.indexOf(framework), frameworks.indexOf(framework) + 1);
	frameworks.forEach(e => $('.' + e).addClass('hidden'));
	$('.' + framework).removeClass('hidden');
	$('.framework-type').text(display[index]);
	let configs = $('input[type="radio"]:checked');
	$('#template-url').attr('href', `https://github.com/AlanDelip/Doploy/tree/${configs.eq(0).val()}-${configs.eq(1).val()}`);
}

export function updateDatabase(e) {
	let databases = ["mysql", "postgresql", "mongodb"];
	let display = ["MySQL", "PostgreSQL", "MongoDB"];
	database = e.value;
	let index = databases.indexOf(database);
	$('#selected-database').text(display[index]);
	databases.splice(databases.indexOf(database), databases.indexOf(database) + 1);
	databases.forEach(e => $('.' + e).addClass('hidden'));
	$('.' + database).removeClass('hidden');
	$('.db-type').text(display[index]);
	let configs = $('input[type="radio"]:checked');
	$('#template-url').attr('href', `https://github.com/AlanDelip/Doploy/tree/${configs.eq(0).val()}-${configs.eq(1).val()}`);

	let portInput = $('#db-port-input');
	switch (database) {
		case 'mysql':
			portInput.val(3306);
			break;
		case 'postgresql':
			portInput.val(5432);
			break;
		case 'mongodb':
			portInput.val(27017);
			break;
		default:
			break;
	}
}

function checkNotNull(param) {
	return (param && param !== '') ? param : null;
}

export function generate(e) {
	let $loading = $('.loading');
	$loading.removeClass('hidden');
	$(e).attr('disabled', true);

	let type = `${framework}_${database}`;
	let dbuser = $('#db-user-input').val();
	let dbpassword = $('#db-password-input').val();
	let dbname = $('#db-name-input').val();
	let dbport = $('#db-port-input').val();
	let dbrootpass = $('#db-root-pass-input').val();
	let dbhost = $('#db-host-input').val();
	let entry = $('#entry-input').val();
	let port = $('#port-input').val();
	let dependencies = $('#dependencies-input').val();
	let artifactId = $('#artifact-input').val();
	let version = $('#version').val();

	axios.post('https://api.do-ploy.com/generator', {
		type: type,
		dbuser: checkNotNull(dbuser),
		dbpassword: checkNotNull(dbpassword),
		dbname: !nodb ? checkNotNull(dbname) : null,
		dbport: checkNotNull(dbport),
		dbhost:checkNotNull(dbhost),
		dbrootpass: checkNotNull(dbrootpass),
		entry: checkNotNull(entry),
		port: checkNotNull(port),
		dependencies: checkNotNull(dependencies),
		artifactId: checkNotNull(artifactId),
		version: checkNotNull(version)
	})
		.then(res => {
			$(e).removeAttr('disabled');
			$loading.addClass('hidden');
			$('#notification').html('<div class="notification success">Generated!</div>');

			let $list = $('#script-list');
			$list.children().eq(1).remove();
			$list.children().eq(1).remove();
			console.log(res);
			res.data.forEach(d => {
				$list.append(`<a class="btn block flex-wrp flex-column item-center ml-s" href="${d.url}">
                                        <img width="30"
                                             src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+PGc+PGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDk4Ljk2NiwzMzkuOTQ2Yy03LjE5NywwLTEzLjAzNCw1LjgzNy0xMy4wMzQsMTMuMDM0djQ5LjgwNGMwLDI4Ljc0Ny0yMy4zODgsNTIuMTM1LTUyLjEzNSw1Mi4xMzVINzguMjAzICAgIGMtMjguNzQ3LDAtNTIuMTM1LTIzLjM4OC01Mi4xMzUtNTIuMTM1VjM1Mi45OGMwLTcuMTk3LTUuODM1LTEzLjAzNC0xMy4wMzQtMTMuMDM0QzUuODM1LDMzOS45NDYsMCwzNDUuNzgyLDAsMzUyLjk4djQ5LjgwNCAgICBjMCw0My4xMjEsMzUuMDgyLDc4LjIwMyw3OC4yMDMsNzguMjAzaDM1NS41OTRjNDMuMTIxLDAsNzguMjAzLTM1LjA4Miw3OC4yMDMtNzguMjAzVjM1Mi45OCAgICBDNTEyLDM0NS43ODIsNTA2LjE2NSwzMzkuOTQ2LDQ5OC45NjYsMzM5Ljk0NnoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0ZGRkZGRiIgZGF0YS1vbGRfY29sb3I9IiNGRkY2RjYiPjwvcGF0aD4KCTwvZz4KPC9nPjxnPgoJPGc+CgkJPHBhdGggZD0iTTQxOS44MzMsMzkxLjNIOTIuMTY3Yy03LjE5NywwLTEzLjAzNCw1LjgzNy0xMy4wMzQsMTMuMDM0czUuODM1LDEzLjAzNCwxMy4wMzQsMTMuMDM0aDMyNy42NjUgICAgYzcuMTk5LDAsMTMuMDM0LTUuODM1LDEzLjAzNC0xMy4wMzRDNDMyLjg2NiwzOTcuMTM3LDQyNy4wMzEsMzkxLjMsNDE5LjgzMywzOTEuM3oiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0ZGRkZGRiIgZGF0YS1vbGRfY29sb3I9IiNGRkY2RjYiPjwvcGF0aD4KCTwvZz4KPC9nPjxnPgoJPGc+CgkJPHBhdGggZD0iTTM4Ny45MTksMjA3LjkzYy00Ljc5NS01LjM2Ny0xMy4wMzQtNS44MzQtMTguNDA0LTEuMDM4bC0xMDAuNDgyLDg5Ljc2NVY0NC4wNDhjMC03LjE5Ny01LjgzNS0xMy4wMzQtMTMuMDM0LTEzLjAzNCAgICBjLTcuMTk3LDAtMTMuMDM0LDUuODM1LTEzLjAzNCwxMy4wMzR2MjUyLjYwOWwtMTAwLjQ4Mi04OS43NjRjLTUuMzY3LTQuNzk2LTEzLjYwNy00LjMyOC0xOC40MDQsMS4wMzggICAgYy00Ljc5NCw1LjM2OS00LjMzMSwxMy42MDksMS4wMzcsMTguNDA0bDEwOS4xNzQsOTcuNTI3YzYuMTg3LDUuNTI5LDEzLjk0Niw4LjI5MiwyMS43MDgsOC4yOTIgICAgYzcuNzU5LDAsMTUuNTE5LTIuNzYzLDIxLjcwOC04LjI4OWwxMDkuMTc0LTk3LjUzQzM5Mi4yNSwyMjEuNTM3LDM5Mi43MTQsMjEzLjI5NywzODcuOTE5LDIwNy45M3oiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0ZGRkZGRiIgZGF0YS1vbGRfY29sb3I9IiNGRkY2RjYiPjwvcGF0aD4KCTwvZz4KPC9nPjwvZz4gPC9zdmc+"/>
                                        <div>${d.detail}</div>
                                    </a>`)
			});
			$list.removeClass('hidden');
		})
		.catch(err => {
			$(e).removeAttr('disabled');
			$loading.addClass('hidden');
			console.log(err);
			$('#notification').html('<div class="notification fail">Something went wrong, please try again.</div>');
		});
}

export function updateScript() {
	let gitUrl = $("#giturl-input").val();
	let temp = gitUrl.split(".git")[0].split("/");
	let projectName = temp[temp.length - 1];
	let os = $("input[name='os']:checked").val();

	let gitInstall = "";
	if (os === 'ubuntu' || os === 'debian') {
		gitInstall = "sudo apt update && sudo apt -y install git";
	} else if (os === 'centos') {
		gitInstall = "sudo yum -y install git";
	}

	$("#deploy-key").val(`${gitInstall} && git clone ${gitUrl} && cd ${projectName} && bash init-script.sh -o ${os} && sudo docker-compose up`);
}
