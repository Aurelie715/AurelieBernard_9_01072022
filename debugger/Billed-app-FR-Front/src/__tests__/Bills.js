/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import "@testing-library/jest-dom";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      //Affiche la view
      document.body.innerHTML = BillsUI({ data: bills });
      //récupère toutes les dates écrites de cette façon
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      //tri les dates par ordre décroissant
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// test si on clique sur l'icône eye alors la modale apparaît
describe("when I click the eye icon", () => {
  test("a modal should appear", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const billsInitialization = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });
    const handleClickIconEye = jest.fn((icon) => billsInitialization.handleClickIconEye(icon));
    const eye = screen.getAllByTestId("icon-eye");
    const modaleFile = document.getElementById("modaleFile");
    $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
    eye.forEach((icon) => {
      icon.addEventListener("click", handleClickIconEye(icon));
      userEvent.click(icon);
      expect(handleClickIconEye).toHaveBeenCalled();
    });
    expect(modaleFile).toHaveClass("show");
  });
});

// test d'intégration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      // création du localStorage avec le profil employé
      const mockedBills = mockStore.bills();
      jest.spyOn(mockStore, "bills");
      const listMock = jest.fn(mockedBills.list);
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: listMock,
        };
      });

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      window.onNavigate(ROUTES_PATH.Bills);
      expect(listMock).toHaveBeenCalled();
      expect(listMock.mock.results[0].value).resolves.toHaveLength(4);
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              //simuler erreur 404 en réponse à la promesse
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        //rediriger vers bills
        window.onNavigate(ROUTES_PATH.Bills);
        //attend réponse de la promesse
        await new Promise(process.nextTick);
        //on attend le chargement de la page
        const message = await screen.getByText(/Erreur 404/);
        //On vérifie qu'on a bien le message erreur 404
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
