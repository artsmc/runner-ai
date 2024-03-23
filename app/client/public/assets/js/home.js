$(document).ready(function () {
  App.initHome();
  $('.owl-carousel').owlCarousel({
    items:1,
    margin:10,
    dots: false,
    nav: false
});
  $('.expand-fullscreen').on('click', App.expandFullscreen);
  $('.compress-fullscreen').on('click', App.contractFullscreen);
  $('.raise-hand').on('click', raisedHand);
  $('.raise-god').on('click', raiseGod);
  $('.slide .header h1').fitText();
  
  addEventListener("fullscreenchange", (event) => App.watchFullscreen(event));
  // Define the keyup event handler
  function onKeyUp(event) {
      if (event.code === 'ArrowLeft' || event.code === '37') {
        $('.owl-carousel').trigger('prev.owl.carousel', [300]);
      }

      else if (event.code === 'ArrowRight' || event.code === '39') {
        // Your code for handling Right Arrow Key Up
        $('.owl-carousel').trigger('next.owl.carousel');
      }
      else if (event.code === 'Space') {
        console.log('Spacebar released');
        // Your code for handling Spacebar release
        raisedHand()
      } 
      else if (event.code === 'KeyG') {
        console.log('G released');
        raiseGod(0)
      }
  }
  function raisedHand() {
    const man = myPixiApp.findShapeById(App.man.user);
    App.updateOffset({ user: App.man.user, offset: man.offset + App.man.offsetNumber }).then(sucess=>{
      App.findUsers().then(users => {
      App.printUsers(users);
      App.users = users;
    });
    man.shiftShape(man.offset + App.man.offsetNumber);
    });
  }
  function raiseGod() {
    const allShapes = myPixiApp.shapes.forEach(shape => {
      shape.shiftShape(100);
    });
    const man = myPixiApp.findShapeById(App.man.user);
    App.updateAllOffset().then(all => {
      App.findUsers().then(users => {
        App.printUsers(users);
        App.users = users;
      });
    });
  }
  // Add the keyup event listener to the document
  document.addEventListener('keyup', onKeyUp);
});
const App = {
  man: null,
  users: [],
  expandFullscreen: () => {
    $('#reg-app').get(0).requestFullscreen();
  },
  contractFullscreen: () => {
    document.exitFullscreen();
  },
  watchFullscreen: (event) => {
    console.log(event);
    if (document.fullscreenElement) {
      $('.expand-fullscreen').toggleClass('is-hidden');
      $('.compress-fullscreen').toggleClass('is-hidden');
    } else {
      $('.expand-fullscreen').toggleClass('is-hidden');
      $('.compress-fullscreen').toggleClass('is-hidden');
    }
  },
  validateForm: () => {
    // Check if any value in formData is null
    const isFormIncomplete = $('#email').val() === null || $('#email').val() === '';
    if (isFormIncomplete) {
      // If there's a null value, show validation error
      validationError('Please enteer valid email address');
      return false; // Indicate that validation failed
    }
    // Other validation logic can go here
    return true; // Indicate that validation passed
  },
  findUsers: async (user) => {
    try {
      const response = await $.ajax({
        url: "/api/v1/user/all",
        type: "GET",
        processData: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
      });
      // Check if the response status is 200
      if (response) {
        return response;
      }
    } catch (error) {
      App.handleError(error);
    }
  },
  createUser: async (user) => {
    $('.loading-overlay').addClass('is-active');
    try {
      const response = await $.ajax({
        url: "/api/v1/user/create",
        type: "POST",
        processData: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(user),
      });
      // Check if the response status is 200
      if (response) {
        $('.loading-overlay').removeClass('is-active');
        // App.handleSuccess(response);
        return response;
      }
    } catch (error) {
      $('.loading-overlay').removeClass('is-active');
      App.handleError(error);
    }
  },
  updateOffset: async (user) => {
    $('.loading-overlay').addClass('is-active');
    try {
      const response = await $.ajax({
        url: "/api/v1/user/update-offset",
        type: "POST",
        processData: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(user),
      });
      // Check if the response status is 200
      if (response) {
        $('.loading-overlay').removeClass('is-active');
        App.handleSuccess(response);
        return response;
      }
    } catch (error) {
      $('.loading-overlay').removeClass('is-active');
      App.handleError(error);
    }
  },
  updateAllOffset: async () => {
    $('.loading-overlay').addClass('is-active');
    try {
      const response = await $.ajax({
        url: "/api/v1/user/update-all-offset",
        type: "POST",
        processData: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({}),
      });
      // Check if the response status is 200
      if (response) {
        $('.loading-overlay').removeClass('is-active');
        App.handleSuccess(response);
        return response;
      }
    } catch (error) {
      $('.loading-overlay').removeClass('is-active');
      App.handleError(error);
    }
  },
  modifyUserDate: async (user) => {
    $('.loading-overlay').addClass('is-active');
    try {
      const response = await $.ajax({
        url: `/api/v1/user/update-modified/${user}`,
        type: "POST",
        processData: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({}),
      });
      // Check if the response status is 200
      if (response) {
        $('.loading-overlay').removeClass('is-active');
        App.handleSuccess(response);
        return response;
      }
    } catch (error) {
      $('.loading-overlay').removeClass('is-active');
      App.handleError(error);
    }
  },
  handleError: (jqXHR, textStatus, errorThrown) => {
    // Handle error for other statuses
    validationError('Not a valid email');
    // Example: Show an error message
  },
  handleSuccess: (response) => {
    // Handle success (status 200)
    // Example: Show a success message or redirect
    console.log('Success:', response);
    successToast('🤚 Your hand has been raised');
  },
  onFormSubmit: async (e) => {
    const isFormValid = login.validateForm();
    if (isFormValid) {
      login.ajaxSubmit();
    }
    return;
  },
  generateUniqueId: () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';

    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters[randomIndex];
    }
    return uniqueId;
  },
  getStoredUser() {
    return localStorage.getItem('user');
  },
  clearUser() {
    localStorage.removeItem('user');
  },
  saveUser(token, callback) {
    const user = token;
    if (user) {
      localStorage.setItem('user', user);
      console.log('user id saved.');
    } else {
      console.log('No user found');
    }
    callback();
  },
  updateUsers(users) {
    const currentUsers = App.users;
  },
  printMain() {
    console.log('printing main');
    const user = myPixiApp.findShapeById(App.man.user) ? myPixiApp.findShapeById(App.man.user).shiftShape(App.man.offset) : new Shape({
      name: App.man.user,
      offset: App.man.offset,
      friction: 0.9,
      color: '#2AA0B0',
      size: 20,
      trail: true
    });
    user.init();
  },
  updateUsers(user) {
    return App.users.find(u => u.user === user.user);
  },
  printUsers(users) {
    users.map(user => {
      if (user.user === App.man.user) {
        return;
      }

      const shape = myPixiApp.findShapeById(user.user) ? myPixiApp.findShapeById(user.user).shiftShape(user.offset) : null;
      if (!shape) {
        new Shape({
          name: user.user,
          offset: user.offset,
          friction: 0.9,
          color: App.generateRandomColor(),
          size: 20,
          trail: false
        }).init();
        console.log(shape, user);
      } else {
        shape.init()
      }
    })
  },
  initHome() {
    if (!App.getStoredUser()) {
      const user = App.createUser({
        user: App.generateUniqueId(),
        offset: 100
      });
      user.then(user => {
        App.man = user;
        App.saveUser(user.user, () => {
          App.findUsers().then(users => {
            App.printMain(user.user);
            App.printUsers(users);
            App.users = users;
          });
        })
        App.findUsers();
      })
    } else {
      const userId = App.getStoredUser();
      App.findUsers().then(users => {
        if (users && users.length > 0) {
          App.man = users.filter(user => user.user === userId)[0];
          App.printMain(App.man.user);
          App.printUsers(users);
          App.users = users;
        } else {
          App.modifyUserDate(userId).then((user) => {
            App.man = user;
            App.printMain(userId);
          })
        }
      })
    }
  },
  generateRandomColor() {
    const colors = ['#545863', '#00E8FC', '#F96E46', '#F99B46', '#F9C846', '#F9C846', '#FCD695', '#FFE3E3'];

    // Select a random color from the array of colors
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Convert the hex color to an RGBA color with 80% opacity
    let r = parseInt(randomColor.slice(1, 3), 16);
    let g = parseInt(randomColor.slice(3, 5), 16);
    let b = parseInt(randomColor.slice(5, 7), 16);

    const colorWithOpacity = `rgba(${r},${g},${b},0.8)`;

    return colorWithOpacity;
  }
}