import $ from "jquery";

export function changeCSSColumnWidth() {
  //Sets CSS of page to display everything correctly
  $(".rm_").css({
    width: "4%",
  });
  $(".btnAddToMyCourseBin").css({
    width: "12%",
    float: "right",
  });

  $(".session").css({
    width: "4%",
  });

  $(`<style type='text/css'>
@media (min-width: 992px) {
    .text-md-center {
        text-align: center;
    }
}

.spots_remaining {
    padding-right: 2rem;
    border-radius: 24px;
}

.overlaps {
    background-color: rgba(255, 134, 47, 0.37);
    border-radius: 24px;
}

.closed {
    background-color: rgba(255,118,96,0.29);
    border-radius: 24px;
}

.closedAndOverlaps {
    background: linear-gradient(to right, rgba(240, 65, 36, 0.45), rgba(234,121,39,0.37)) !important;
}

.crsTitlCustom {
color: black;
font-size: 1rem;
}

     </style>`).appendTo("head");
}
