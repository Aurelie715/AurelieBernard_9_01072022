/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
// import "@testing-library/jest-dom";
import { handleChangeFile } from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);
global.alert = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then message icon in vertical layout should be higlighted", async () => {
      // const html = NewBillUI();
      // document.body.innerHTML = html;
      //to-do write assertion
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
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  // describe("when I choose a file", () => {
  //   test("it should be in the right format", () => {
  //     // jest.spyOn(mockStore, "bills");

  //     const onNavigate = (pathname) => {
  //       document.body.innerHTML = ROUTES({ pathname });
  //     };
  //     Object.defineProperty(window, "localStorage", { value: localStorageMock });
  //     window.localStorage.setItem(
  //       "user",
  //       JSON.stringify({
  //         type: "Employee",
  //       })
  //     );
  //     document.body.innerHTML = NewBillUI();
  //     const newBill = new NewBill({
  //       document,
  //       onNavigate,
  //       store: mockStore,
  //       localStorage,
  //     });
  //     const fakeFile = new File(["image"], "image.jpg", { type: "image/jpg" });
  //     // const form = screen.getByTestId("form-new-bill");
  //     const fileInput = screen.getByTestId("file");
  //     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

  //     fileInput.addEventListener("change", handleChangeFile);
  //     userEvent.upload(fileInput, fakeFile);

  //     expect(fileInput.files[0].name).toBeDefined();
  //     expect(handleChangeFile).toBeCalled();
  //   });
  // });
});

// test d'intégration POST

describe("Given I am a user connected as an Employee", () => {
  describe("When I am on NewBill Page and I click on send button of a completed form", () => {
    test("should submit bills from mock api post", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const onNavigate = (pathname) => {
        document.getElementById("root").innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.getElementById("root").innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      const fakeFile = new File(["image"], "image.jpg", { type: "image/jpg" });
      // const form = screen.getByTestId("form-new-bill");
      const fileInput = screen.getByTestId("file");

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      fileInput.addEventListener("change", handleChangeFile);
      userEvent.upload(fileInput, fakeFile);

      expect(fileInput.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      fileInput.addEventListener("submit", handleSubmit);
      fireEvent.submit(fileInput);
      expect(handleSubmit).toBeCalled();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        console.error = jest.fn();
        console.error.mockClear();
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        // console.log("test sdfgsrtdhtyjgdhjrtdy");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill);
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        newBill.fileUrl = "test";

        const form = screen.getAllByTestId("form-new-bill")[0];
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalled();
        await new Promise(process.nextTick);
        // console.log(console.error);
        expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"));
      });
      test("fetches bills from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill);
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        newBill.fileUrl = "test";
        const form = screen.getAllByTestId("form-new-bill")[0];
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalled();
        await new Promise(process.nextTick);
        // console.log(console.error);
        expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
      });

      // test("fetches messages from an API and fails with 500 message error", async () => {
      //   mockStore.bills.mockImplementationOnce(() => {
      //     return {
      //       update: () => {
      //         return Promise.reject(new Error("Erreur 500"));
      //       },
      //     };
      //   });
      //   window.onNavigate(ROUTES_PATH.NewBill);
      //   await new Promise(process.nextTick);
      //   const message = await screen.getByText(/Erreur 500/);
      //   expect(message).toBeTruthy();
      // });
    });
  });
});

// const getPost = jest.spyOn(mockStore.bills(), "update");

// const newBill = {
//   id: "36tAXb6fI52zOKkopl85",
//   vat: "70",
//   fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
//   status: "pending",
//   type: "Hôtel et logement",
//   commentary: "test",
//   name: "test4",
//   fileName: "preview-facture-free-201801-pdf-1.jpg",
//   date: "2018-02-03",
//   amount: 1000,
//   commentAdmin: "super",
//   email: "a@a",
//   pct: 20,
// };

// const bills = await mockStore.bills().update(newBill);

// expect(getPost).toHaveBeenCalledTimes(1);
// expect(bills.data.length).toBe(5);
// // console.log(bills.length);

// const typeOfSpending = (screen.getByTestId("expense-type").value = "Transports");
// const spendingName = (screen.getByTestId("expense-name").value = "Hotel Paris");
// const date = (screen.getByTestId("datepicker").value = "12/03/2021");
// const amount = (screen.getByTestId("amount").value = "500");
// const vat = (screen.getByTestId("vat").value = "20");
// const pct = (screen.getByTestId("pct").value = "20");
// const comment = (screen.getByTestId("commentary").value = "blabla");
