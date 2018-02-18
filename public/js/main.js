$(document).ready(function () {
  $.ajax({
    method: 'get',
    url: "https://jonlu.ca/soc_api/admin/users",
    type: 'json',
    success: function (data, textStatus, jqXHR) {
      //Handle data and status code here
      let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      for (var person of data) {
        var time = new Date(person.date);
        var timeMS = time.getTime() / 1000;
        let row = `<tr><td>${person.email}</td><td>${person.phone}</td><td>${person.department}</td><td>${person.uid}</td><td>${person.date.toLocaleString('en-us', options)}</td><td>${person.email_sent}</td><td>${person.valid}</td><td>${person.semester}</td><td>${timeMS}</td></tr>`;
        $('#data tr:last').after(row);
      }
    }
  });
});
