# Personal Portfolio – SagoMade

### Video Demo:

https://youtu.be/wBHqlOYGtAY

### Description:

My coding journey began with learning front-end development fundamentals through **HTML and CSS**, which enabled me to transform static designs into web experiences. As I progressed, I developed an interest in creating dynamic, interactive websites, naturally drawing me toward JavaScript and modern frameworks. For my final project, I built a **personal portfolio website** that showcases my skills in a practical, personal way. This site not only demonstrates my technical abilities but also serves as a platform to present my professional work, projects, and design philosophy to potential clients and employers.

I built this project with **React** and **TypeScript**, taking advantage of React's modular structure, scalability, and rich ecosystem. I created a **component architecture** where each section (landing page, about, contact, projects) functions as a reusable component, keeping the codebase clean and maintainable. For navigation, I used **React Router** to create a seamless multi-page experience within a single-page framework. The **landing page** features engaging scroll-based interactions, including an **infinite scroll effect** and **dynamic scroll behaviors** that reveal content and animations progressively. Rather than hardcoding pages, I implemented **dynamic page templates** that pull content from structured data, making the portfolio flexible and easy to update. I also focused on **web optimization** by minimizing asset sizes, optimizing images, and refining code structure for faster loading and smooth performance across all devices.

---

### Repository Structure

The repository for my project is available here:

https://github.com/SantiMejia99/sagomade-website

Below is an overview of the important files and folders:

- **`/public`**  
  Contains static assets such as fonts, images, GIFs, and videos. Includes the `index.html` file, which serves as the entry point of the app. Files in this folder are publicly accessible and bypass the build process.  
  - **`/fonts`**: Custom fonts like `Espacio Ideal.otf`.  
  - **`/gifs`**: Original and optimized GIFs for the project.  
  - **`/videos`**: Optimized video files converted from GIFs.  
  - **`/projects`**: Project-specific images.  

- **`/src`**  
  The main source folder where all React and TypeScript code resides. Key subfolders include:  
  - **`App.tsx`**: The root component that defines the app's structure and page routing.  
  - **`main.tsx`**: The entry file that renders the React app into the DOM.  
  - **`/components`**: Contains reusable components like `NavigationMenu`, `CustomCursor`, and UI elements such as `Button`, `Carousel`, and `Table`.  
  - **`/pages`**: High-level page components such as `Home`, `About`, `Contact`, and `Project-page`.  
  - **`/app`**: Includes dashboard-related data like `data.json`.  
  - **`/lib`**: Utility functions, such as `cn` for merging class names.  
  - **`/hooks`**: Custom React hooks for managing state and mobile behavior.  

- **`package.json`**  
  Defines project dependencies, scripts, and metadata. Includes React, TypeScript, React Router, and animation libraries.  

- **`tsconfig.json`**  
  Configures TypeScript behavior, enforcing strict typing rules to reduce runtime errors.  

- **`.gitignore`**  
  Specifies files and folders to exclude from version control, such as `node_modules` and build outputs.  

- **`README.md`**  
  Provides documentation about the project, its purpose, and its structure.  

---

### Technical Decisions

- **React with TypeScript**  
  Used React for its component-based architecture, and TypeScript ensures type safety, reducing runtime errors and improving maintainability.  

- **React Router**  
  Enables navigation between pages like `Home`, `About`, `Contact`, and `Projects` while maintaining a single-page application structure.  

- **Reusable Components**  
  Components like `NavigationMenu`, `CustomCursor`, `Carousel`, and `Table` are designed for reusability and consistency across the app.  

- **Dynamic Content**  
  Content is dynamically rendered using JSON data, allowing for easy updates without modifying the codebase.  

- **Performance Optimization**  
  Techniques like lazy loading, code splitting, and asset optimization are implemented to ensure smooth performance across devices.  

- **Custom Utilities and Hooks**  
  Utilities like `cn` simplify class name management, while custom hooks manage state, mobile breakpoints, and behavior efficiently.  

- **Tailwind CSS**  
  Used for styling, enabling a utility-first approach to create responsive and consistent designs.  

---

### Conclusion

This portfolio project reflects both my coding journey and my technical growth in building modern, efficient web applications. By combining my foundation in HTML and CSS with the capabilities of React and TypeScript, I've created a portfolio that's visually engaging and technically sound. The project not only showcases my work but also serves as a foundation I can build upon as I continue to develop as a programmer and designer.