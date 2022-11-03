/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);
global.alert = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then message icon in vertical layout should be higlighted", async () => {
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
});

// test d'intégration POST

describe("Given I am a user connected as an Employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      //initialisation de la page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      document.getElementById("root").innerHTML = NewBillUI();
      //crée un mock de mockstore.bills et garde l'implémentation de mockedBills
      jest.spyOn(mockStore, "bills");
    });

    test("should be able to upload a jpg image", async () => {
      //crée un mock pour la méthode create
      const createMock = jest.fn().mockResolvedValue({ fileUrl: "image.jpg" });
      const updateMock = jest.fn().mockResolvedValue({});
      mockStore.bills
        .mockImplementationOnce(() => {
          return {
            create: createMock,
          };
        })
        .mockImplementationOnce(() => {
          return {
            update: updateMock,
          };
        });
      const onNavigate = (pathname) => {
        document.getElementById("root").innerHTML = ROUTES({ pathname });
      };
      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      //test
      //On crée un faux fichier jpg
      const fakeFilejpg = new File(["image"], "image.jpg", { type: "image/jpg" });
      //On va chercher file Input sur la page
      const fileInput = screen.getByTestId("file");

      userEvent.upload(fileInput, fakeFilejpg);

      expect(fileInput.files[0].name).toBeDefined();
      expect(createMock).toHaveBeenCalled();

      await new Promise(process.nextTick);

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      expect(updateMock).toHaveBeenCalled();
    });

    test("should be able to upload a jpeg image", async () => {
      const createMock = jest.fn().mockResolvedValue({});
      const updateMock = jest.fn().mockResolvedValue({});
      mockStore.bills
        .mockImplementationOnce(() => {
          return {
            create: createMock,
          };
        })
        .mockImplementationOnce(() => {
          return {
            update: updateMock,
          };
        });
      const onNavigate = (pathname) => {
        document.getElementById("root").innerHTML = ROUTES({ pathname });
      };
      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      const fakeFilejpeg = new File(["image"], "image.jpeg", { type: "image/jpeg" });
      const fileInput = screen.getByTestId("file");

      userEvent.upload(fileInput, fakeFilejpeg);

      expect(fileInput.files[0].name).toBeDefined();
      expect(createMock).toHaveBeenCalled();

      await new Promise(process.nextTick);

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      expect(updateMock).toHaveBeenCalled();
    });

    test("should be able to upload a png image", async () => {
      const createMock = jest.fn().mockResolvedValue({});
      const updateMock = jest.fn().mockResolvedValue({});
      mockStore.bills
        .mockImplementationOnce(() => {
          return {
            create: createMock,
          };
        })
        .mockImplementationOnce(() => {
          return {
            update: updateMock,
          };
        });
      const onNavigate = (pathname) => {
        document.getElementById("root").innerHTML = ROUTES({ pathname });
      };
      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      const fakeFilepng = new File(["image"], "image.png", { type: "image/png" });
      const fileInput = screen.getByTestId("file");

      userEvent.upload(fileInput, fakeFilepng);

      expect(fileInput.files[0].name).toBeDefined();
      expect(createMock).toHaveBeenCalled();

      await new Promise(process.nextTick);

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      expect(updateMock).toHaveBeenCalled();
    });

    test("shouldn't be able to upload a Pdf file", async () => {
      const createMock = jest.fn().mockResolvedValue({});
      const updateMock = jest.fn().mockResolvedValue({});
      mockStore.bills
        .mockImplementationOnce(() => {
          return {
            create: createMock,
          };
        })
        .mockImplementationOnce(() => {
          return {
            update: updateMock,
          };
        });
      const onNavigate = (pathname) => {
        document.getElementById("root").innerHTML = ROUTES({ pathname });
      };
      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      const fakeFilePdf = new File(["image"], "image.Pdf", { type: "image/Pdf" });
      const fileInput = screen.getByTestId("file");

      userEvent.upload(fileInput, fakeFilePdf);

      expect(fileInput.files[0].name).toBeDefined();
      expect(createMock).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.getByText("Les extensions acceptées sont jpg, jpeg et png")).toBeTruthy());

      await new Promise(process.nextTick);

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      expect(updateMock).not.toHaveBeenCalled();
    });

    afterEach(() => {
      mockStore.bills.mockRestore();
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
        expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
      });
    });
  });
});

// describe("Given I am a user connected as an Employee", () => {
//   describe("When I am on NewBill Page and I click on send button of a completed form", () => {
//     test("should submit bills from mock api post", async () => {
//       //initialisation de la page
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);

//       const onNavigate = (pathname) => {
//         document.getElementById("root").innerHTML = ROUTES({ pathname });
//       };
//       Object.defineProperty(window, "localStorage", { value: localStorageMock });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//           email: "a@a",
//         })
//       );
//       document.getElementById("root").innerHTML = NewBillUI();
//       const newBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage,
//       });

//       //test
//       //On crée un faux fichier jpg
//       const fakeFilejpg = new File(["image"], "image.jpg", { type: "image/jpg" });
//       //On va chercher file Input sur la page
//       const fileInput = screen.getByTestId("file");
//       //mock la fonction handleChangeFile
//       const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

//       fileInput.addEventListener("change", handleChangeFile);
//       userEvent.upload(fileInput, fakeFilejpg);

//       expect(fileInput.files[0].name).toBeDefined();
//       expect(handleChangeFile).toBeCalled();

//       const fakeFilePng = new File(["image"], "image.png", { type: "image/png" });
//       //utilise la library jest pour upl
//       userEvent.upload(fileInput, fakeFilePng);

//       expect(fileInput.files[0].name).toBeDefined();
//       expect(handleChangeFile).toBeCalled();

//       const fakeFilePdf = new File(["image"], "image.pdf", { type: "image/pdf" });
//       userEvent.upload(fileInput, fakeFilePdf);
//       expect(fileInput.files[0].name).toBeDefined();
//       await waitFor(() => expect(screen.getByText("Les extensions acceptées sont jpg, jpeg et png")).toBeTruthy());

//       const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
//       fileInput.addEventListener("submit", handleSubmit);
//       fireEvent.submit(fileInput);
//       expect(handleSubmit).toBeCalled();
//     });
//     describe("When an error occurs on API", () => {
//       beforeEach(() => {
//         console.error = jest.fn();
//         console.error.mockClear();
//         jest.spyOn(mockStore, "bills");
//         Object.defineProperty(window, "localStorage", { value: localStorageMock });
//         window.localStorage.setItem(
//           "user",
//           JSON.stringify({
//             type: "Employee",
//           })
//         );
//         const root = document.createElement("div");
//         root.setAttribute("id", "root");
//         document.body.appendChild(root);
//         router();
//       });
//       test("fetches bills from an API and fails with 404 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             update: () => {
//               return Promise.reject(new Error("Erreur 404"));
//             },
//           };
//         });
//         window.onNavigate(ROUTES_PATH.NewBill);
//         const newBill = new NewBill({
//           document,
//           onNavigate,
//           store: mockStore,
//           localStorage: window.localStorage,
//         });
//         newBill.fileUrl = "test";

//         const form = screen.getAllByTestId("form-new-bill")[0];
//         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
//         form.addEventListener("submit", handleSubmit);
//         fireEvent.submit(form);
//         expect(handleSubmit).toHaveBeenCalled();
//         await new Promise(process.nextTick);
//         expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"));
//       });
//       test("fetches bills from an API and fails with 500 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             update: () => {
//               return Promise.reject(new Error("Erreur 500"));
//             },
//           };
//         });
//         window.onNavigate(ROUTES_PATH.NewBill);
//         const newBill = new NewBill({
//           document,
//           onNavigate,
//           store: mockStore,
//           localStorage: window.localStorage,
//         });
//         newBill.fileUrl = "test";
//         const form = screen.getAllByTestId("form-new-bill")[0];
//         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
//         form.addEventListener("submit", handleSubmit);
//         fireEvent.submit(form);
//         expect(handleSubmit).toHaveBeenCalled();
//         await new Promise(process.nextTick);
//         expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
//       });
//     });
//   });
// });
