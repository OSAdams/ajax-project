const searchInput = document.querySelector('.search-input');
const keywordSearch = document.querySelector('#keyword-search');
const featureSection = document.querySelector('.feature-container');
const resultSection = document.querySelector('.result-container');
const resultDataList = document.querySelector('.result-data-list');
const homeIcon = document.querySelector('.fas.fa-home');

/*
  # searchRecipes will send an XHRHttpsRequest to our public API (Free Meal API)
  # The response will be parsed and stored in our data.searchData object which
  # will be used for the entirety of the app!
*/

function searchRecipes(keyword) {
  if (!keyword.length > 3) {
    console.error({ error: 'search input must be at least 3 characters' });
    return { error: 'Please expand your search value to beyond 3 characters!' };
  }
  let searchData = null;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + keyword);
  xhr.addEventListener('load', () => {
    searchData = JSON.parse(xhr.response);
    data.searchData = searchData;
    data.dataView = 'search';
    featureSection.className = 'search-container hidden';
    resultSection.className = 'result-container';
  });
  xhr.send();
}

function windowHashString(string) {
  const newString = string.split(' ').join('');
  return newString;
}

function searchForm(event) {
  event.preventDefault();
  const convertedString = windowHashString(searchInput.value);
  searchRecipes(convertedString);
  setTimeout(() => {
    searchInput.value = '';
    data.prevSearch = convertedString;
    window.location.hash = '';
    window.location.hash += '#search?keyword=' + convertedString;
    // eslint-disable-next-line
    console.log('searchForm, data.searchData value: ', data.searchData)
    renderRecipeCards(data.searchData);
  }, 600);
}

/*
  # This function is called in our searchForm function. We will use data.searchData
  # object value to render our data in the recipe cards
*/

function renderRecipeCards(array) {
  resultDataList.innerHTML = '';
  const { meals } = array;
  for (let i = 0; i < meals.length; i++) {
    const newCard = {
      cardContainer: newElement('div', { className: 'recipe-card', id: meals[i].idMeal }),
      bgImage: newElement('div', { className: 'recipe-img', image: meals[i].strMealThumb }),
      title: newElement('h3', { textContent: meals[i].strMeal }),
      recipeDuration: newElement('p', { textContent: 'Prep Time: ' + meals[i].readyInMinutes + ' minutes' }),
      recipeNutrition: newElement('p', { textContent: '<a href="https://panlasangpinoy.com/beef-asado/" target="__blank">Full Recipe</a>' }),
      recipeContext: newElement('div', { className: 'recipe-context' })
    };
    newCard.cardContainer.appendChild(newCard.bgImage);
    newCard.recipeContext.appendChild(newCard.title);
    newCard.recipeContext.appendChild(newCard.recipeDuration);
    newCard.recipeContext.appendChild(newCard.recipeNutrition);
    newCard.cardContainer.appendChild(newCard.recipeContext);
    newCard.cardContainer.addEventListener('click', e => {
      renderRecipe(e, meals);
    });
    resultDataList.appendChild(newCard.cardContainer);
    resultSection.appendChild(resultDataList);
  }
}

/*
  # Create an element and set attributes with values
*/

function newElement(tag, options) {
  if (!tag || typeof tag !== 'string') return { error: 'The element tag is required' };
  const element = document.createElement(tag);
  if (options) {
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.image) element.style.backgroundImage = ('url(' + options.image + ')');
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
  }
  return element;
}

/*
  # Grab the elements in the DOM that we are going to use to show the recipe.
  # recipeData is an object that we will use for our recipe data
*/

const recipeSection = document.querySelector('.recipe-container');
const recipeDataContainer = document.querySelector('.recipe-data-container');
let recipeData = null;

function renderRecipe(event, array) {
  document.querySelector('.recipe-data-container').innerHTML = '';
  const cardID = event.currentTarget.getAttribute('id');
  const recipeArray = array;
  for (let i = 0; i < recipeArray.length; i++) {
    if (parseInt(cardID) === recipeArray[i].id) {
      recipeData = null;
      const clickedRecipe = recipeArray[i];
      data.recipeData = clickedRecipe;
      const fullRecipe = {
        bgImage: newElement('div', { className: 'info-image', image: clickedRecipe.image }),
        titleContainer: newElement('div', { className: 'info-title' }),
        title: newElement('h3', { textContent: clickedRecipe.title }),
        ingredientHeader: newElement('h3', { textContent: 'Ingredients' }),
        ingredientContainer: newElement('div', { className: 'ingredients-data' }),
        instructionContainer: newElement('div', { className: 'instruction-data' }),
        instructionHeader: newElement('h3', { textContent: 'Instructions' }),
        // use variable to display summary for future feature
        // null
        summary: newElement('div', { className: 'info-summary', innerHTML: removeTags(clickedRecipe.summary) }),
        // end null
        ingredients: clickedRecipe.nutrition.ingredients.slice(),
        instructions: clickedRecipe.analyzedInstructions[0].steps.slice(),
        ingredientUl: newElement('ul'),
        instructionOl: newElement('ol'),
        containerOne: newElement('div', { className: 'recipe-block' }),
        containerTwo: newElement('div', { className: 'recipe-block-two' }),
        recipeIngredients: function (array) {
          for (let i = 0; i < array.length; i++) {
            const ingredient = {
              li: newElement('li'),
              name: newElement('span', { className: 'ingr-name', textContent: array[i].name + ': ' }),
              amount: newElement('span', { className: 'ingr-amount', textContent: array[i].amount + ' ' + array[i].unit })
            };
            ingredient.li.appendChild(ingredient.name);
            ingredient.li.appendChild(ingredient.amount);
            this.ingredientUl.appendChild(ingredient.li);
          }
        },
        recipeInstructions: function (array) {
          let step = 1;
          for (let i = 0; i < array.length; i++) {
            const number = newElement('span', { className: 'instruction-number', textContent: step + ') ' });
            const instruction = {
              li: newElement('li', { textContent: array[i].step })
            };
            instruction.li.prepend(number);
            this.instructionOl.appendChild(instruction.li);
            step++;
          }
        }
      };
      fullRecipe.titleContainer.appendChild(fullRecipe.title);
      fullRecipe.containerOne.appendChild(fullRecipe.bgImage);
      fullRecipe.containerOne.appendChild(fullRecipe.titleContainer);
      fullRecipe.instructionContainer.appendChild(fullRecipe.instructionHeader);
      fullRecipe.recipeInstructions(fullRecipe.instructions);
      fullRecipe.instructionContainer.appendChild(fullRecipe.instructionOl);
      fullRecipe.containerTwo.appendChild(fullRecipe.instructionContainer);
      fullRecipe.recipeIngredients(fullRecipe.ingredients);
      fullRecipe.ingredientContainer.appendChild(fullRecipe.ingredientHeader);
      fullRecipe.ingredientContainer.appendChild(fullRecipe.ingredientUl);
      fullRecipe.containerTwo.appendChild(fullRecipe.ingredientContainer);
      recipeDataContainer.appendChild(fullRecipe.containerOne);
      recipeDataContainer.appendChild(fullRecipe.containerTwo);
      recipeData = clickedRecipe;
      recipeControls(recipeDataContainer, recipeData);
      recipeSection.className = 'recipe-container';
      resultSection.className = 'result-container hidden';
    }
  }

}

/*
  # click event listener for the search button
  # which will call the searchForm function
*/

keywordSearch.addEventListener('click', searchForm);

window.addEventListener('hashchange', e => {
  if (data.dataView === 'search') {
    renderRecipeCards(data.searchData);
  }
});

homeIcon.addEventListener('click', event => {
  featureSection.className = 'feature-container';
  resultSection.className = 'result-container hidden';
  recipeSection.className = 'recipe-container hidden';
  data.dataView = 'home';
});

/*
  # This function is used if we have a string containing special characters that
  # will negatively impact our rendered data.
*/

function removeTags(str) {
  const error = {};
  if (!str) {
    error.error = 'Invalid string argument';
    return error;
  } else { str = str.toString(); }
  return str.replace(/(<([^>]+)>)/ig, '');
}

function recipeControls(parent, object) {
  const actionLib = {
    container: newElement('div', { className: 'action-container', id: 'recipe-actions' }),
    saveButton: newElement('button', { className: 'action-button', textContent: 'Save Recipe' })
  };
  actionLib.saveButton.addEventListener('click', e => {
    data.savedData[data.saveId] = {
      recipe: object,
      date: new Date()
    };
    data.saveId++;
  });
  actionLib.container.appendChild(actionLib.saveButton);
  parent.appendChild(actionLib.container);
}

/*
 # NOTES: 1A 30-12-2023
 # Updating the Order of Operations in the following functions:
 # searchRecipes, searchForm - awaiting tests.
 #
 # NOTES: 1B 01-01-2024
 # Our data is now being used correctly. We need to ensure the data does NOT
 # reset when the user refreshes the page.
 # The functionality of the app is working mostly, as intended. WIP.
 #
*/
