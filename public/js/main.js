$(document).ready(function () {
  $.ajax({
    method: 'get',
    url: "https://jonlu.ca/soc/admin/users",
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
      for (let person of data) {
        for (let course of person.sectionsWatching) {
          let time = new Date(course.date);
          let timeMS = time.getTime() / 1000;
          let row = `<tr>`;
          row += `<td>${person.email}</td>`;
          row += `<td>${person.phone}</td>`;
          row += `<td>${course.department}</td>`;
          row += `<td>${person.uscID}</td>`;
          row += `<td>${course.date.toLocaleString('en-us', options)}</td>`;
          row += `<td>${course.notified}</td>`;
          row += `<td>${person.validAccount}</td>`;
          row += `<td>${person.semester}</td>`;
          row += `<td>${timeMS}</td></tr>`;
          $('#data tr:last').after(row);
        }
      }
    }
  });
});
