import $ from "jquery";

export const cardWrapper = $("#card-wrapper");
const cardBody = $("#map-card-body");
const cardCloseButton = $("#card-close");

export const showCard = () => {
  cardWrapper.removeClass("d-none");
};

export const hideCard = () => {
  cardWrapper.addClass("d-none");
  $("#search").removeClass("d-none");
  $("#filter-buttons").removeClass("d-none");
};

export const updateCard = (feature, cardContentFactory) => {
  cardBody.empty();
  const cardContent = cardContentFactory(feature);
  cardBody.append($(cardContent));
};

cardCloseButton.on("click", () => {
  hideCard();
});
