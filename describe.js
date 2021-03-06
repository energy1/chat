для запуска сервера: в папке сервера npm i => npm start
html также открыть на сервере, на сервер обращаться ws://localhost:5000

Необходимо релизовать frontend чата.

- Регистрация
При открытии странички, необходимо вывести форму входа (имя и логин)
Имя и логин - обязательны.
Логин может состоять только из букв и цифр. Соответсвенно, необходимо проверять вводимые данные и выводить информацию об ошибках.

Если все данные введены верно, то необхоидмо создать соединение при помощи web socket с адресом ws://smelukov.com:5000 и отправить JSON в таком формате:
{
	op: 'reg',
	data: {
		name: 'введенное имя',
		login: 'введенный лоигин'
	}
}

Перед тем, как отправлять запрос на регистрацию, подпишитесь на событие message созданного соединения, потому что сервер будет отвечать на ваши команды только при помощи отправки сообщений в вашу сторону.
Вот пример создания сокета и подписки на его события:

var connection = new WebSocket('ws://smelukov.com:5000');

connection.onmessage = function(e) {
    //пришло сообщение от сервер, надо его обработать
    console.log(e.data);
};
connection.onerror = function(e) {
    //ошибка соединения
    console.log(e);
};
connection.onerror = function(e) {
    //соединение было закрыто
    console.log(e);
};
connection.onopen = function() {
	//соединение установлено
    //отправить запрос о регистрации
};


Какие сообения могут приходить от сервера:
=========
- Подтверждение регистрации
{
    op: 'token',
    sourceOp: 'reg',
    token: '..........', //уникальный идентификатор. Сохраните его! При последующих запросах необходимо его передавать
    messages: [.......], //последние 10 сообщений в чате
    users: ['.......'] //список пользователей в чате
}

Если произошла ошибка при регистрации (например пользователь с таким логином уже в чате), то будет прислано:
{
	op: 'error',
	sourceOp: 'reg',
	error: {
		message: '.......' //описание ошибки 
	}
}
=========

=========
- Новый пользователь вошел в чат
{
	op: 'user-enter', 
	user: {
		name: '....'
		login: '....'
	}
}

При получении такого сообщения, необходимо добавить пользователя в список пользователей
=========

=========
- Пользователь вышел из чата
{
	op: 'user-out', 
	user: {
		name: '....'
		login: '....'
	}
}

При получении такого сообщения, необходимо удалить пользователя в списка
=========

=========
- Пользователь отправил новое сообщение в чат
{
    op: 'message',
    user: {
    	name: '......', //имя автора сообщения
    	login: '......' //логин автора сообщения
    },
    body: '.....', //тело сообщения
    time: ...... //время отправки сообщения
}

При получении такого сообщения, необходимо добавить новое сообщение в список сообщений чата
=========

=========
- Пользователь сменил фото
{
    op: 'user-change-photo',
    user: {
    	name: user.name,
    	login: user.login
    }
}

При получении такого сообщения, необходимо найти все сообщения этого пользователя и заменить у них аватар
Аватар пользователя можно получить обратившись по адресу: http://smelukov.com:5000/photos/ЛОГИН
Вместо "ЛОГИН" надо подставить логин пользователя, аватар которого хотите получить
Если у интересуемого пользователя нет аватара, то вертнется картинка с надписью "no photo"
=========

- Отправка сообщений производится при помощи отправки на сервер следующей команды:
{
	op: 'message',
	token: '.....', //уникальный идентификатор, полученный при регистрации
	data: {
		body: '......' //тело сообщения
	}
}

- Установка аватара
После успешной регистрации, можно нажать на свой аватар (в левом верхнем углу).
Должно открыться окно для загрузки картинки.
В окне есть прямоугольная область, в которую необходимо ПЕРЕТАЩИТЬ файл из файловой системы.
Необходимо так же обработать указанный файл: загружать можно только jpg-файлы, размер которых состовляет не более 512кб.
Если указанный файл прошел проверку, то картинка должна отобразится в этой прямоугольной области для предпросмотра.
После этого, пользователь должен нажать на кнопку "загрузить" и указанный файл должен отправиться POST-запросом, при помощи ajax, по адресу http://smelukov.com:5000/upload
Помимо самого файла, необходимо указать token, полученный при регистрации.
Пример:
var data = new FromData();

data.append('photo', file);
data.append('token', '....');

ajax.send(data);

FromData - это объект, встроенный в браузер (ознакомьтесь с документацией на него).

=================

Пример реализованного чата - http://smelukov.com:4000/

Если мой сервер будет падать(у меня там мало оперативной памяти), то я выдам вам сервер и вы будете запускать его локально