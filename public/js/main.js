$(document).ready(function () {
  $("#addID").click(e => {
    $.ajax({
      method: 'POST',
      url: "admin/addId",
      type: 'json',
      data: {
        id: $("#addIdValue").val()
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data);
        console.log(jqXHR.status);
        if (jqXHR.status === 200) {
          $("#addID").after("<div>Added ids!</div>");
        }
      },
      error: function (data, status) {
        $("#addID").after("<div>Error!</div>");

      }
    });
  });

  $.ajax({
    method: 'GET',
    url: "admin/ids",
    type: 'json',
    success: function (data, textStatus, jqXHR) {
      let allRows = '';
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      for (const id of data) {
        let row = `<tr>`;
        row += `<td>${id.paidId}</td>`;
        row += `<td>${id.date.toLocaleString('en-us', options)}</td>`;
        row += `<td>${id.semester}</td>`;
        allRows += row;
      }
      $('#data tr:last').after(allRows);
    }
  });
});
