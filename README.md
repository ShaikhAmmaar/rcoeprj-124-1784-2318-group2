# NESTMATES

> **Abstract** : Nestmates is an application that simplifies finding suitable rooms and roommates. Users create profiles highlighting their preferences, interests, and living habits, making it easier to discover compatible people. The platform also offers a room search feature with filters for amenities, helping users choose spaces that fit their needs. With clear information about people and accommodations, Nestmates supports informed decisions and provides a simple, user-friendly solution for shared living.

### Project Members
1. ORAWALA MOHAMMED UMAR AFZAL  [ Team Leader ]
2. SHAIKH SUBHANA SALIM
3. ANSARI ADEENA MAQSOOD ALAM
4. SHAIKH MOHAMMED AMMAAR ABID

### Project Guides
1. PROF. PRADHYUMAN GUPTA  [ Primary Guide ]

### Deployment Steps
Please follow the below steps to run this project.

1. Clone the repository and open the `app-main` folder.
2. Start MongoDB locally (default used in this project: `mongodb://localhost:27017`).
3. Configure backend environment in `backend/.env` with:
	- `MONGO_URL`
	- `DB_NAME`
	- `SECRET_KEY`
4. Create and activate a Python virtual environment in `backend`.
5. Install backend dependencies:
	- `pip install -r requirements.txt`
6. Run backend server from `backend`:
	- `uvicorn server:app --reload --host 0.0.0.0 --port 8001`
7. Configure frontend environment in `frontend/.env`:
	- Set `EXPO_PUBLIC_BACKEND_URL` to your backend URL (example: `http://localhost:8001` for local testing).
8. Install frontend dependencies from `frontend`:
	- `npm install`
9. Start Expo frontend:
	- `npm run start`
10. Open the app in Expo Go, Android/iOS simulator, or web.

### Subject Details
- Class : SE (COMP) Div A - 2025-2026
- Subject : Mini Project-I (MP-1)
- Project Type : Mini Project

### Platform, Libraries and Frameworks used
1. [Expo](https://expo.dev/)
2. [React Native](https://reactnative.dev/)
3. [Expo Router](https://docs.expo.dev/router/introduction/)
4. [FastAPI](https://fastapi.tiangolo.com/)
5. [MongoDB](https://www.mongodb.com/)
6. [Motor (Async MongoDB Driver)](https://motor.readthedocs.io/)
7. [JWT (PyJWT)](https://pyjwt.readthedocs.io/)
8. [Axios](https://axios-http.com/)

### Dataset Used
1. No external dataset is used in this project.
2. The application uses user-generated data (profiles, preferences, and room listings) stored in MongoDB.

### References
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/manual/introduction/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

My references:

[1] D. Gale and L. S. Shapley, "College admissions and the stability of marriage," American Mathematical Monthly, vol. 69, no. 1, pp. 9-15, Jan. 1962.

[2] O. P. John and S. Srivastava, "The Big Five trait taxonomy: History, measurement, and theoretical perspectives," in Handbook of Personality: Theory and Research, L. A. Pervin and O. P. John, Eds. New York: Guilford Press, 1999, pp. 102-138.

[3] E. Ciscato, A. Galichon, and M. Gousse, "Like attract like? A structural comparison of homogamy across same-sex and different-sex households," Journal of Political Economy, vol. 128, no. 2, pp. 740-781, 2020.

[4] Y. Xu, S. Brinton, and J. Herder, "Comparing cross-platform mobile application development frameworks: React Native and Flutter performance analysis," in Proc. IEEE Int. Conf. Mobile Softw. Eng. Syst., Montreal, Canada, 2022, pp. 45-54.

[5] S. Ramirez, "FastAPI: Modern, fast web framework for building APIs with Python," GitHub repository, 2023. [Online]. Available: https://github.com/tiangolo/fastapi

[6] MongoDB, Inc., "MongoDB documentation: Introduction to MongoDB," MongoDB Manual, 2023. [Online]. Available: https://www.mongodb.com/docs/manual/introduction/

[7] Expo Team, "Expo documentation," Expo Dev, 2023. [Online]. Available: https://docs.expo.dev/
