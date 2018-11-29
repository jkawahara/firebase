# Getting Started - Train Scheduler
### 1. Why/Background
  * This is Berkeley Coding Boot Camp (BCBC) week 4 homework assignment.
  * The BCBC curriculum generally focuses on JavaScript along with HTML/CSS, using the MERN (MongoDB, Express, React, Node) software stack, to teach web development skills across HTML/CSS/Javascript. 

### 2. What/Objective
  * This homework covers the following aspects of web development on the client side, using a realtime database, jQuery, Moment.js, Bootstrap, to build a train scheduling web-based application. ![trainscheduler.png](assets/images/trainscheduler.png "app UI")

### 3. How
  * User Story 1- When adding trains, administrators should be able to submit the following: Train Name, Destination, First Train Time -- in military time, Frequency -- in minutes
  * User Story 2- Calculate when the next train will arrive; this should be relative to the current time
  * User Story 3- Users from many different machines must be able to view same train times
  * User Story 4- Update your "minutes to arrival" and "next train time" text once every minute
  * User Story 5- Add update and remove buttons for each train. User can edit the row's elements (train's Name, Destination and Arrival Time) then, by relation, minutes to arrival
    * As clarification, if Arrival Time is changed, the Next Arrival will show the Arrival Time until train arrives. As soon as train arrives, the Next Arrival Time will return to original calculation use First Train Time

  * Prerequisites for Development:
    * MacBook Air (Intel Core i7, 2.2 GHz, 1 Processor, 2 Cores, 8GB)
    * git version 2.18.0
    * Visual Studio Code Version 1.29.1
    * [GitHub](https://github.com/jkawahara/firebase)
    * Chrome Version 70.0.3538.102 (Official Build) (64-bit)

  * Built With:
    * Custom HTML / CSS / JavaScript.
    * [Firebase](https://www.gstatic.com/firebasejs/5.5.9/firebase.js)
    * [Moment.js](https://cdn.jsdelivr.net/momentjs/2.12.0/moment.min.js)
    * [Bootstrap](https://getbootstrap.com/docs/4.1/getting-started/introduction/)
    * [jQuery](https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js)

  * Installing: Refer to Prerequisites and Deployment.

  * Running the tests: Unit and integration testing informally executed.

  * Deployment: Deployed on [GitHub pages](https://jkawahara.github.io/firebase/).

## Versioning
  * For the versions available, see the tags on this repository.

## Authors
  * John Kawahara.
  * N/A- See also the list of contributors who participated in this project.

## License
  * This project is licensed under the [MIT License](LICENSE).

## Acknowledgments
  * Thanks to BCBC program personnel for their guidance on this project.
