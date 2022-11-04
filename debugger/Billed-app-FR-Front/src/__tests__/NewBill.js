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

      //simule la connection d'un utilisateur
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      //met le html dans la div root
      document.getElementById("root").innerHTML = NewBillUI();
      //crée un mock de mockstore.bills et garde l'implémentation du store de bills
      jest.spyOn(mockStore, "bills");
    });

    test("should be able to upload a jpg image", async () => {
      //crée un mock pour la méthode create (fonction asynchrone)
      const createMock = jest.fn().mockResolvedValue({ fileUrl: "image.jpg" });
      const updateMock = jest.fn().mockResolvedValue({});
      //on change l'implémentation du store mocké une fois
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

      //déclenche l'upload du fichier image.jpg dans l'input
      userEvent.upload(fileInput, fakeFilejpg);

      expect(fileInput.files[0].name).toBeDefined();
      //teste que la méthode create a bien été appelée
      expect(createMock).toHaveBeenCalled();

      //permet d'attendre que la promesse de create soit résolue(la fin de l'upload) avant de passer à la suite
      await new Promise(process.nextTick);

      //On va chercher le formulaire
      const form = screen.getByTestId("form-new-bill");
      //déclenche le submit sur le formulaire
      fireEvent.submit(form);
      //teste que la méthode update a bien été appelée
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

    //on détruit le mock à cause de test PDF car il ne va pas appeler les méthodes create et update
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
