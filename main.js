document.addEventListener('DOMContentLoaded', function() {

  let clientsData = [];
  let getSearchResult;

  const modalWindow = document.querySelector('.main__modal.modal');
  const deleteClientForm = document.forms.delete;

  const tableBody = document.querySelector('.table__body')
  const tableSortBtns = document.querySelectorAll('button[data-sort]');

  // contains variables, functions and event listeners providing search implementation
  function searchSetUp() {

    const logo = document.querySelector('.header__logo');
    const searchMatchList = document.querySelector('.search__matchlist');
    const headerBtnsCard = document.querySelector('.header__btns');
    const searchForm = document.forms.search;

    const openSearchBtn = document.querySelector('button[data-btn-action="open-search"]');
    const closeSearchBtn = document.querySelector('button[data-btn-action="close-search"]');

    searchForm.search.addEventListener('focus', function() {
      searchMatchList.style.visibility = 'visible';
    });

    searchForm.search.addEventListener('keydown', function(k) {

      if (!searchMatchList.hasChildNodes()) {
        return;
      };

      if (k.code === 'ArrowDown') {
        k.preventDefault();
        searchMatchList.firstChild.firstChild.focus();
        return;
      };

      if (k.code == 'ArrowUp') {
        k.preventDefault();
        searchMatchList.lastChild.firstChild.focus();
        return;
      }

    });

    searchForm.search.addEventListener('input', function() {

      clearTimeout(getSearchResult);

      const searchValue = this.value.trim();

      if (!searchValue) {
        searchMatchList.innerHTML = '';
        return;
      }

      getSearchResult = setTimeout(async function() {

        searchMatchList.innerHTML = '';

        const response = await fetch(`http://localhost:3000/api/clients/?search=${searchValue}`);
        const result = await response.json();

        result.forEach((client) => {

          const clientListItem = document.createElement('li');
          clientListItem.classList.add('search__matchlist-item');

          const clientLink = document.createElement('a');
          clientLink.classList.add('search__matchlist-item-link');
          clientLink.href = `#${client.id}`;
          clientLink.textContent = [client.surname, client.name, client.lastName].join(' ');

          clientLink.addEventListener('click', function() {
            searchMatchList.style.visibility = 'hidden';
            document.getElementById(`${client.id}`).animate([{backgroundColor: 'transparent'}, {backgroundColor: '#eee'}, {backgroundColor: 'transparent'}], {duration: 2500, iterations: 1});
          });

          clientLink.addEventListener('keydown', function(k) {

            if (k.code === 'ArrowDown') {
              k.preventDefault();

              if (!this.parentElement.nextElementSibling) {
                searchForm.search.focus();
                return;
              };

              this.parentElement.nextElementSibling.firstChild.focus();
              return;

            };

            if (k.code === 'ArrowUp') {
              k.preventDefault();

              if (!this.parentElement.previousElementSibling) {
                searchForm.search.focus();
                return;
              }

              this.parentElement.previousElementSibling.firstChild.focus();
              return;

            }

          });

          clientListItem.append(clientLink);
          searchMatchList.append(clientListItem);

        });

      }, 300);

    });

    openSearchBtn.addEventListener('click', function() {

      this.setAttribute('inert', '');
      searchForm.removeAttribute('inert');
      closeSearchBtn.removeAttribute('inert');

      headerBtnsCard.classList.add('btns-card--active');
      logo.classList.add('header__logo--hidden');

      logo.addEventListener('transitionend', function() {
        searchForm.classList.add('header__form--active');
      }, {once: true});

    });

    closeSearchBtn.addEventListener('click', function() {

      this.setAttribute('inert', '');
      searchForm.setAttribute('inert', '');
      openSearchBtn.removeAttribute('inert');

      searchMatchList.style.visibility = '';
      headerBtnsCard.classList.remove('btns-card--active');
      searchForm.classList.remove('header__form--active');

      searchForm.addEventListener('transitionend', function() {
        logo.classList.remove('header__logo--hidden');
      }, {once: true});

    });

    window.addEventListener('resize', function() {

      if (window.innerWidth > 576) {
        searchForm.removeAttribute('inert');
        return;
      };

      if (!searchForm.classList.contains('header__form--active')) {
        searchForm.setAttribute('inert', '');
      };

    });

  };

  // contains variables, functions and event listeners providing forms implementation
  function formsSetUp() {

    const Client = function(name, surname, lastName = false, contacts = false) {

      this.name = name;

      this.surname = surname;

      if (lastName && typeof lastName === 'string') {
        this.lastName = lastName;
      }

      if (contacts && contacts instanceof Array) {
        this.contacts = contacts;
      }

    };

    const addClientForm = document.forms.add;
    const editClientForm = document.forms.edit;

    const openAddFormBtn = document.querySelector('button[data-btn-action="add"]');
    const cancelBtns = document.querySelectorAll('button[data-btn-action="cancel"]');
    const addContactBtns = document.querySelectorAll('button[data-btn-action="contact-add"]');

    const formInputs = document.querySelectorAll('.form__input');
    const validateInputs = document.querySelectorAll('input[data-validate="true"]');

    function closeForm(form) {

      let currentForm;

      if (form.tagName === 'FORM') {
        currentForm = form;
      } else {
        currentForm = this.form;
      }

      currentForm.classList.remove('form--active');
      const errorsOutput = currentForm.querySelector('.form__error-msg');

      if (currentForm === addClientForm || currentForm === editClientForm) {

        const contactsContainer = currentForm.querySelector('.form__contacts-list');

        setTimeout(() => {

          validateInputs.forEach((input) => {
            input.classList.remove('--error');
          });

          contactsContainer.outerHTML = '<ul class="form__contacts-list"></ul>';
          currentForm.elements.addContact.style.display = 'flex';
          errorsOutput.innerHTML = '';
          currentForm.reset();

        }, 300);

        window.history.pushState('', '/', window.location.pathname);
        currentForm.classList.remove('form--hidden');
        document.body.classList.remove('stop-scroll');
        modalWindow.classList.remove('modal--active');
        return;

      };

      const hiddenForm = Array.from(document.forms).find(form => form.classList.contains('form--hidden'));

      if (hiddenForm) {
        hiddenForm.classList.remove('form--hidden');
        return;
      };

      document.body.classList.remove('stop-scroll');
      modalWindow.classList.remove('modal--active');

      errorsOutput.innerHTML = '';
      currentForm.reset();

    };

    function createContactItem(contactType = false, contactValue = false) {

      const contactItem = document.createElement('li');
      contactItem.classList.add('form__contacts-list-item', 'flex');

      const customSelect = document.createElement('div');
      customSelect.classList.add('form__contacts-list-item-custom-select', 'custom-select');

      const customSelectInput = document.createElement('input');
      customSelectInput.setAttribute('hidden', '');
      customSelectInput.name = `contact-type`;

      const customSelectBtn = document.createElement('button');
      customSelectBtn.classList.add('custom-select-btn');
      customSelectBtn.setAttribute('type', 'button');
      customSelectBtn.innerHTML = `
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.495029 0.689971C0.250029 0.934971 0.250029 1.32997 0.495029 1.57497L4.65003 5.72997C4.84503 5.92497 5.16003 5.92497 5.35503 5.72997L9.51003 1.57497C9.75503 1.32997 9.75503 0.93497 9.51003 0.68997C9.26503 0.44497 8.87003 0.44497 8.62503 0.68997L5.00003 4.30997L1.37503 0.684972C1.13503 0.444972 0.735029 0.444971 0.495029 0.689971Z"/>
      </svg>`;

      customSelectBtn.addEventListener('click', function() {
        this.classList.toggle('custom-select-btn--active');
        this.nextElementSibling.toggleAttribute('inert');
      });

      customSelectBtn.addEventListener('keydown', function(k) {

        if (k.code === 'ArrowDown' && this.classList.contains('custom-select-btn--active')) {
          k.preventDefault();
          this.nextElementSibling.firstChild.focus();
          return;
        };

        if (k.code === 'ArrowUp' && this.classList.contains('custom-select-btn--active')) {
          k.preventDefault();
          this.nextElementSibling.lastChild.focus();
          return;
        };

      });

      const customSelectList = document.createElement('ul');
      customSelectList.setAttribute('inert', '');
      customSelectList.classList.add('custom-select-list');

      const typesArray = ['Телефон', 'Email', 'Vk', 'Facebook', 'Другое']

      const customSelectOptions = typesArray.map((type) => {

        const customSelectOption = document.createElement('li');
        customSelectOption.setAttribute('tabindex', '0');
        customSelectOption.classList.add('custom-select-list-item');
        customSelectOption.dataset.option = type;
        customSelectOption.textContent = type;

        return customSelectOption;

      });

      customSelectOptions.forEach((option) => {

        option.addEventListener('click', function() {

          customSelectOptions.forEach((option) => {
            delete option.dataset.selected;
          });

          this.dataset.selected = '';

          customSelectBtn.classList.remove('custom-select-btn--active');
          customSelectBtn.innerHTML = `
          ${this.textContent}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.495029 0.689971C0.250029 0.934971 0.250029 1.32997 0.495029 1.57497L4.65003 5.72997C4.84503 5.92497 5.16003 5.92497 5.35503 5.72997L9.51003 1.57497C9.75503 1.32997 9.75503 0.93497 9.51003 0.68997C9.26503 0.44497 8.87003 0.44497 8.62503 0.68997L5.00003 4.30997L1.37503 0.684972C1.13503 0.444972 0.735029 0.444971 0.495029 0.689971Z"/>
          </svg>`;

          customSelectInput.value = this.dataset.option;
          customSelectList.setAttribute('inert', '');

        });

        option.addEventListener('keydown', function(k) {

          if (k.code === 'ArrowDown') {
            k.preventDefault();
            if (!this.nextElementSibling) {
              customSelectBtn.focus();
              return;
            }
            this.nextElementSibling.focus();
            return;
          };

          if (k.code === 'ArrowUp') {
            k.preventDefault();
            if (!this.previousElementSibling) {
              customSelectBtn.focus();
              return;
            }
            this.previousElementSibling.focus();
            return;
          };

          if (k.code === 'Enter' || k.code === 'Space') {
            k.preventDefault();
            this.click();
            customSelectBtn.focus();
            return;
          };

        });

        customSelectList.append(option);

      });

      customSelect.append(customSelectInput, customSelectBtn, customSelectList);

      const selectedContactType = contactType || 'Телефон';

      const selectedOption = customSelectOptions.find((option) => {
        return option.dataset.option === selectedContactType;
      });

      selectedOption.dataset.selected = '';
      customSelectInput.value = selectedOption.dataset.option;
      customSelectBtn.append(selectedOption.textContent);

      const contactInput = document.createElement('input');
      contactInput.setAttribute('type', 'text');
      contactInput.name = `contact-value`;
      contactInput.placeholder = 'Введите данные контакта';
      contactInput.value = contactValue || '';

      contactInput.addEventListener('input', function() {
        this.classList.remove('--error')
      });

      const deleteContactBtn = document.createElement('button');
      deleteContactBtn.classList.add('form__contacts-list-item-btn', 'flex');
      deleteContactBtn.setAttribute('type', 'button');
      deleteContactBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"/>
      </svg>`

      deleteContactBtn.addEventListener('click', function() {
        this.form.elements.addContact.style.display = 'flex';
        contactItem.remove();
      });

      contactItem.append(customSelect, contactInput, deleteContactBtn);

      return contactItem;

    };

    function getFormContacts(formData) {
      const contactTypes = formData.getAll('contact-type');
      const contactValues = formData.getAll('contact-value');

      return contactTypes.map((element, index) => {
        return item = {type: element, value: contactValues[index].trim()};
      });
    };

    function formValidate(form, errorsOutput) {

      const data = new FormData(form);

      const name = data.get('name');
      const surname = data.get('surname');
      const contactValues = data.getAll('contact-value');
      const errorsText = [];

      if (!name.trim()) {
        errorsText.push('Ошибка: Не указано имя');
        form.name.classList.add('--error')
      }

      if (!surname.trim()) {
        errorsText.push('Ошибка: Не указана фамилия');
        form.surname.classList.add('--error')
      }

      if (contactValues.some((value) => !value.trim())) {
        errorsText.push('Ошибка: Не все добавленные контакты полностью заполнены');

        const contacts = form.elements.namedItem('contact-value');

        if (!contacts.length) {

          contacts.classList.add('--error');

        } else {
          Array.from(contacts).forEach((contact) => {
            if (!contact.value) {

              contact.classList.add('--error');

            };
          });
        };

      };

      if (!errorsText.length) {
        return true;
      };

      errorsOutput.innerHTML = errorsText.join('<br>');
      return false;

    };

    async function hundleFailedRequest(form, response, errorsOutput) {

      if (response.status === 404) {
        errorsOutput.textContent = 'Клиент не найден';
      }

      if (response.status === 422) {

        const message = await response.json();
        const errorsText = [];

        message.errors.forEach(({field, message}) => {
          errorsText.push(`Ошибка: ${message}`);

          if (field === 'contacts') {
            const contactsInput = form.elements.namedItem('contact-value');

            if (!contactsInput.length) {
              contactsInput.classList.add('--error');
            }

            Array.from(contactsInput).forEach((input) => {

              if (!input.value) {
                input.classList.add('--error');
              };

            });

            return;
          };

          form.elements[field].classList.add('--error');
        });

        errorsOutput.innerHTML = errorsText.join('<br>');

      };

      if (response.status >= 500) {
        errorsOutput.textContent = 'Что-то пошло не так...';
      };

    };

    // forms submit events
    addClientForm.addEventListener('submit', async function(e) {

      e.preventDefault();

      const errorsOutput = this.querySelector('.form__error-msg');
      errorsOutput.innerHTML = '';

      this.style.pointerEvents = 'none';
      e.submitter.classList.add('--is-loading');

      const validationPass = formValidate(this, errorsOutput);

      if (!validationPass) {
        this.style.pointerEvents = 'all';
        e.submitter.classList.remove('--is-loading');
        return;
      }

      const data = new FormData(this);
      const contacts = getFormContacts(data);

      const client = new Client(data.get('name').trim(), data.get('surname').trim(), data.get('lastName').trim(), contacts);

      const response = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        await init();
        closeForm(addClientForm);
      } else {
        await hundleFailedRequest(this, response, errorsOutput);
      };

      this.style.pointerEvents = 'all';
      e.submitter.classList.remove('--is-loading');

    });

    editClientForm.addEventListener('submit', async function(e) {

      e.preventDefault();

      const errorsOutput = this.querySelector('.form__error-msg');
      errorsOutput.innerHTML = '';

      this.style.pointerEvents = 'none';
      e.submitter.classList.add('--is-loading');

      const validationPass = formValidate(this, errorsOutput);

      if (!validationPass) {
        this.style.pointerEvents = 'all';
        e.submitter.classList.remove('--is-loading');
        return;
      }

      const data = new FormData(this);

      const id = data.get('id').slice(4);
      const contacts = await getFormContacts(data);

      const clientEdited = new Client(data.get('name').trim(), data.get('surname').trim(), data.get('lastName').trim(), contacts);

      const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientEdited),
      });

      if (response.ok) {
        await init();
        closeForm(this);
      } else {
        await hundleFailedRequest(this, response, errorsOutput);
      };

      this.style.pointerEvents = 'all';
      e.submitter.classList.remove('--is-loading');

    });

    deleteClientForm.addEventListener('submit', async function(e) {

      e.preventDefault();

      const errorsOutput = this.querySelector('.form__error-msg');
      errorsOutput.innerHTML = '';

      this.style.pointerEvents = 'none';
      e.submitter.classList.add('--is-loading');

      const id = this.elements.id.value;

      const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await init();
        closeForm(this);
        closeForm(editClientForm);
      } else {
        await hundleFailedRequest(this, response, errorsOutput);
      }

      this.style.pointerEvents = 'all';
      e.submitter.classList.remove('--is-loading');

    });

    // forms control btns events
    openAddFormBtn.addEventListener('click', function() {
      document.body.classList.add('stop-scroll');
      modalWindow.classList.add('modal--active');
      addClientForm.classList.add('form--active');
    });

    cancelBtns.forEach((btn) => {
      btn.addEventListener('click', closeForm);
    });

    // forms child elements events
    formInputs.forEach((element) => {
      element.firstElementChild.addEventListener('change', function(e) {
        if (this.value) {
          element.classList.add('form__input--oninput');
          return;
        };
        element.classList.remove('form__input--oninput');
      });
    });

    validateInputs.forEach((input) => {
      input.addEventListener('input', function() {
        this.classList.remove('--error');
      })
    });

    addContactBtns.forEach((btn) => {
      btn.addEventListener('click', function() {

        const contactsList = btn.previousElementSibling;

        const contactItem = createContactItem();
        contactsList.append(contactItem);

        if (contactsList.childElementCount === 10) {
          this.style.display = 'none';
        };

      })
    });

    // document & window events for forms
    document.addEventListener('click', function(e) {
      if (e.target === modalWindow) {
        [addClientForm, editClientForm, deleteClientForm].forEach((form) => {
          closeForm(form);
        });
      };
    });

    window.addEventListener('hashchange', async function() {

      const hash = window.location.hash;

      async function openEditClientForm() {

        const changeEvent = new Event('change');
        const clientId = hash.slice(5);
        const contactsContainer = editClientForm.addContact.previousElementSibling;

        const clientData = await getClientsData(clientId);

        editClientForm.id.value = 'ID: ' + clientData.id;
        editClientForm.name.value = clientData.name;
        editClientForm.surname.value = clientData.surname;
        editClientForm.lastName.value = clientData.lastName;

        [editClientForm.name, editClientForm.surname, editClientForm.lastName].forEach((input) => {
          input.dispatchEvent(changeEvent);
        });

        await clientData.contacts.forEach(({type, value}) => {
          const contact = createContactItem(type, value);
          contactsContainer.append(contact);
        });

        document.body.classList.add('stop-scroll');
        modalWindow.classList.add('modal--active');
        editClientForm.classList.add('form--active');

      };

      if (hash.match(/#edit\d+$/)) {
        const clientRow = document.getElementById(window.location.hash.slice(5));

        clientRow.scrollIntoViewIfNeeded();
        await openEditClientForm();

        clientRow.querySelector('.--is-loading').classList.remove('--is-loading');
      };

    });

  };

  async function getClientsData(id = '') {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`);
    const result = await response.json();
    return result;
  };

  async function init() {
    tableBody.classList.add('table__body--loading');
    clientsData = await getClientsData();
    clientsData = await sortClients(clientsData);
    setClientsTable(clientsData);
    tableBody.classList.remove('table__body--loading');
  };

  function sortClients(clients) {

    const sortBtn = Array.from(tableSortBtns).find((btn) => {
      return btn.hasAttribute('data-sort-rule');
    });

    const sortBy = sortBtn.dataset.sort;
    const sortRule = +sortBtn.dataset.sortRule;

    function getFullName(client) {
      return [client.surname, client.name, client.lastName].join(' ');
    };

    clients.sort((a, b) => {

      if (sortBy === 'id') {
        return sortRule * ( a.id - b.id );
      };

      if (sortBy === 'fullName') {
        return sortRule * ( getFullName(a).toLowerCase().localeCompare( getFullName(b).toLowerCase() ) );
      };

      if (sortBy === 'dateCreate') {
        return sortRule * ( new Date(a.createdAt) - new Date(b.createdAt) );
      };

      if (sortBy === 'dateChange') {
        return sortRule * ( new Date(a.updatedAt) - new Date(b.updatedAt) );
      };

    });

    return clients;

  };

  function setClientsTable(clients) {

    function createTableRow(client) {

      const contactIcons = {
        'Телефон': `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="8" cy="8" r="8"/>
            <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
          </g>
        </svg>`,

        'Email': `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z"/>
        </svg>`,

        'Vk': `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z"/>
        </svg>`,

        'Facebook': `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z"/>
        </svg>`,

        'Другое': `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z"/>
        </svg>`,
      };

      const tableRow = document.createElement('tr');
      const idCell = document.createElement('td');
      const fullNameCell = document.createElement('td');
      const createDateCell = document.createElement('td');
      const editDateCell = document.createElement('td');
      const contactsCell = document.createElement('td');
      const btnsCell = document.createElement('td');

      const createDate = new Date(client.createdAt);
      const createDateLocal = createDate.toLocaleDateString('ru').split('.').reverse().join('-');
      const createTimeLocal = createDate.toLocaleTimeString('ru').split(':').slice(0, 2).join(':');

      const editDate = new Date(client.updatedAt);
      const editDateLocal = editDate.toLocaleDateString('ru').split('.').reverse().join('-');
      const editTimeLocal = editDate.toLocaleTimeString('ru').split(':').slice(0, 2).join(':');

      const contactsLength = client.contacts.length;

      const contacts = client.contacts.map(({type, value}, index) => {
        return `
        <li class="table__body-contacts-item" data-type="${type}" data-value="${value}" ${ !(contactsLength > 5 && index > 3) || 'hidden' }>
          <span class="table__body-contacts-item-popup" tabindex="0">
            ${contactIcons[type]}
            <p>${type}: <span>${value}</span></p>
          </span>
        </li>`;
      });

      if (contactsLength > 5) {
        contacts.push(`
        <li class="table__body-contacts-item">
        <button class="table__body-contacts-item-btn" type="button">+${contactsLength - 4}</button>
        </li>`);
      };

      tableRow.id = client.id;

      idCell.textContent = client.id;

      fullNameCell.textContent = `${client.surname} ${client.name} ${client.lastName}`;

      createDateCell.innerHTML = `
      <time class="table__body-date" datetime="${createDate.toJSON()}">
        ${createDateLocal}
        <span>${createTimeLocal}</span>
      </time>`;

      editDateCell.innerHTML = `
      <time class="table__body-date" datetime="${editDate.toJSON()}">
        ${editDateLocal}
        <span>${editTimeLocal}</span>
      </time>`;

      contactsCell.innerHTML = `
      <ul class="table__body-contacts flex">
      ${contacts.join('')}
      </ul>`;

      btnsCell.innerHTML = `
      <div class="table__body-btns flex">
        <button class="table__body-btns-edit" type="button" data-btn-action="edit">
          <svg class="icon-regular" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10.5002V13.0002H2.5L9.87333 5.62687L7.37333 3.12687L0 10.5002ZM11.8067 3.69354C12.0667 3.43354 12.0667 3.01354 11.8067 2.75354L10.2467 1.19354C9.98667 0.933535 9.56667 0.933535 9.30667 1.19354L8.08667 2.41354L10.5867 4.91354L11.8067 3.69354Z"/>
          </svg>
          <svg class="icon-loading" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.00008 6.04008C1.00008 8.82356 3.2566 11.0801 6.04008 11.0801C8.82356 11.0801 11.0801 8.82356 11.0801 6.04008C11.0801 3.2566 8.82356 1.00008 6.04008 1.00008C5.38922 1.00008 4.7672 1.12342 4.196 1.34812" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
          </svg>
          Изменить
        </button>

        <button class="table__body-btns-delete" type="button" data-btn-action="delete">
          <svg class="icon-regular" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"/>
          </svg>
          <svg class="icon-loading" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.00008 6.04008C1.00008 8.82356 3.2566 11.0801 6.04008 11.0801C8.82356 11.0801 11.0801 8.82356 11.0801 6.04008C11.0801 3.2566 8.82356 1.00008 6.04008 1.00008C5.38922 1.00008 4.7672 1.12342 4.196 1.34812" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
          </svg>
          Удалить
        </button>
      </div>`


      tableRow.append(idCell, fullNameCell, createDateCell, editDateCell, contactsCell, btnsCell);

      return tableRow;

    };

    tableBody.innerHTML = '';

    clients.forEach((client) => {
      const clientTableData = createTableRow(client);
      tableBody.append(clientTableData);
    });

    const expandContactsBtn = document.querySelectorAll('.table__body-contacts-item-btn')
    const openEditFormBtns = document.querySelectorAll('button[data-btn-action="edit"]');
    const openDeleteFormBtns = document.querySelectorAll('button[data-btn-action="delete"]');

    expandContactsBtn.forEach((btn) => {
      btn.addEventListener('click', function() {
        Array.from(this.closest('ul').children).forEach((listItem) => {
          listItem.removeAttribute('hidden');
        });
        this.parentElement.setAttribute('hidden', '');
      })
    })

    openEditFormBtns.forEach((btn) => {
      btn.addEventListener('click', async function() {

        this.classList.add('--is-loading');
        window.location.hash = `edit${this.closest('tr').id}`;

      });
    });

    openDeleteFormBtns.forEach((btn) => {
      btn.addEventListener('click', function() {

        this.classList.add('--is-loading');

        let id;

        if (this.form) {
          this.form.classList.add('form--hidden');
          id = this.form.elements.id.value.slice(4);
        } else {
          id = this.closest('tr').id;
        }

        deleteClientForm.elements.id.value = id;

        document.body.classList.add('stop-scroll');
        modalWindow.classList.add('modal--active');
        deleteClientForm.classList.add('form--active');

        this.classList.remove('--is-loading');

      });
    });

    function showPopup() {

      const popupContent = this.lastElementChild;
      const popupRect = this.getBoundingClientRect();
      const popupContentRect = popupContent.getBoundingClientRect();
      const tableRow = popupContent.closest('tr');

      // top
      if (
        ( popupRect.top >= (popupContentRect.height + 10) ) &&
        ( popupRect.left >= (popupContentRect.width * .5 + 2) ) &&
        ( window.innerWidth - (popupRect.left + popupRect.width) >= (popupContentRect.width * .5 + 2) ) &&
        ( tableRow.offsetTop - tableBody.scrollTop >= (popupContentRect.height + 10) )
      ) {
        popupContent.classList = '--top';
        return;
      };

      // left
      if (
        ( popupRect.left >= (popupContentRect.width + 10) ) &&
        ( popupRect.top >= (popupContentRect.height * .5 + 2) ) &&
        ( (window.innerHeight - popupRect.top + popupRect.height) >= (popupContentRect.height * .5 + 2) ) &&
        ( tableRow.clientHeight * .5 + (tableRow.offsetTop - tableBody.scrollTop) >= (popupContentRect.height * .5 + 2) )
      ) {
        popupContent.classList = '--left';
        return;
      };

      // bottom
      if (
        ( window.innerHeight - (popupRect.top + popupRect.height) >= (popupContentRect.height + 10) ) &&
        ( popupRect.left >= (popupContentRect.width * .5 + 2) ) &&
        ( window.innerWidth - (popupRect.left + popupRect.width) >= (popupContentRect.width * .5 + 2) ) &&
        ( (tableBody.clientHeight + tableBody.scrollTop) - tableRow.offsetTop >= (popupContentRect.height + 10) )
      ) {
        popupContent.classList = '--bottom';
        return;
      };

      // right
      if (
        ( window.innerWidth - (popupRect.left + popupRect.width) >= (popupContentRect.width + 10) ) &&
        ( popupRect.top >= (popupContentRect.height * .5 + 2) ) &&
        ( window.innerHeight - (popupRect.top + popupRect.height) >= (popupContentRect.height * .5 + 2) ) &&
        ( tableRow.clientHeight * .5 + (tableRow.offsetTop - tableBody.scrollTop) >= (popupContentRect.height * .5 + 2) )
      ) {
        popupContent.classList = '--right';
        return;
      };

      popupContent.classList = '--top';

    };

    document.querySelectorAll('.table__body-contacts-item-popup').forEach((popup) => {
      popup.addEventListener('mouseover', showPopup);
      popup.addEventListener('focus', showPopup);
      popup.addEventListener('click', showPopup);
      popup.addEventListener('click', function() {
        if (window.innerWidth <= 576) {
          this.toggleAttribute('data-popup-active');
        };
      });
      document.addEventListener('click', function(e) {
        if (!e.composedPath().includes(popup)) {
          popup.removeAttribute('data-popup-active');
        }
      });
    });

  };

  // event listeners
  tableSortBtns.forEach((btn) => {
    btn.addEventListener('click',function() {

      const attr = this.getAttribute('data-sort-rule');

      if (attr) {
        this.setAttribute('data-sort-rule', `${-attr}`);
      } else {

        tableSortBtns.forEach((btn) => {
          btn.removeAttribute('data-sort-rule');
        });
        this.setAttribute('data-sort-rule', '1');

      };

      clientsData = sortClients(clientsData);
      setClientsTable(clientsData);

    });
  });

  window.addEventListener('load', async function() {
    await init();
    searchSetUp();
    formsSetUp();
    this.dispatchEvent(new Event('hashchange'));
    this.dispatchEvent(new Event('resize'));
  });

});
