<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Image Build](https://github.com/cr4yfish/nemmy/actions/workflows/docker-build.yml/badge.svg)](https://github.com/cr4yfish/nemmy/actions/workflows/docker-build.yml)


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/cr4yfish/nemmy">
    <img src="https://i.imgur.com/OzAB6Y0.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Nemmy</h3>

  <p align="center">
    The Neat Lemmy App for the Web. This project is focused on building a Lemmy App with the best possible User Experience.
    <br />
    <br />
    <a href="https://nemmy.app/">Website</a>
    ·
    <a href="https://lemmy.world/c/nemmy">Lemmy Community</a>
    .
    <a href="https://github.com/Cr4yfish/Nemmy/issues">Report Bug</a>
    ·
    <a href="https://github.com/Cr4yfish/Nemmy/issues">Request Feature</a>
  </p>
</div>

<div style="width: 100%; display: flex; justify-content: center; gap: 1rem;">
  <img src="https://i.imgur.com/OxkGnC4.png" style="height: 500px; width: auto;" >
  <img src="https://i.imgur.com/twzhIFG.png" style="height: 500px; width: auto;" >
  <img src="https://i.imgur.com/SGJFQuo.png" style="height: 500px; width: auto;" >
  <img src="https://i.imgur.com/BljmUFd.png" style="height: 500px; width: auto;" >
  <img src="https://i.imgur.com/OFc7Va7.png" style="height: 500px; width: auto;" >
  <img src="https://i.imgur.com/8tHc7vx.png" style="height: 500px; width: auto;" >


</div>


<!-- ABOUT THE PROJECT -->
## About The Project

Nemmy is a Progressive Web App (PWA) for Lemmy. Lemmy is kinda like Reddit, but federated so a CEO can't just fuck over everyone. 
The goal of Nemmy is to make using Lemmy on multiple devices a seamless experience.

Right now Nemmy is in very early Development, however, feel free to visit the Website once in a while to see what's changed.

If you like the idea of Nemmy, this is the perfect opportunity for you to influence design decisions by submitting Feedback or Feature requests. You can do that on here in the [Issues Tab](https://github.com/Cr4yfish/Nemmy/issues) or the [Nemmy Community on Lemmy](https://lemmy.world/c/nemmy).

##### Why Nemmy?
There are other good Apps for Lemmy out there, even other PWAs like [wefwef.app](wwefwef.app).
What singles out Nemmy is not focusing on a single devices (e.g. Mobile-only design like wefwef or Desktop Only design like the default Lemmy Web UI) but making the user experience equally good on most devices.

##### What's Lemmy?
The short version is, that Lemmy is similar to Reddit. The main difference is that Lemmy is Open-Source and Federated.
This means that there is no single huge "Lemmy Server" but many smaller "instances" of Lemmy hosted by different people. These instances can communicate with each other, so you can follow people on other instances and see their posts and comments.


### Built With

* Next.js
* Lemmy JS-Client
* Tailwind


## Roadmap for Q3 2023

- [x] Basic APIs
- [X] Voting
    - [X] Voting on Posts
    - [X] Voting on Comments
- [x] PWA
- [X] Community Page
- [ ] Sort/Filter/Search
    - [X] Search
    - [ ] Filter -- Not implemented everywhere yet
    - [ ] Sorting -- Same as Filter
    - [ ] Explore Section
- [ ] Authentication
    - [X] Login
    - [ ] Register
    - [X] Support for multiple instances
    - [X] Subscribing to Communities
- [ ] Creating Content 
    - [X] Creating Comments
    - [X] Creating Posts
    - [ ] Creating Communities
    - [ ] Supporting *all* Lemmy Markdown Features
- [ ] User Page
    - [ ] User Settings
    - [ ] User Notifications
    - [X] User Profile
    - [X] User Posts
    - [X] User Bookmarks
    - [ ] User Comments
- [ ] Sidebar
    - [ ] Subscribed Communities
    - [ ] Instance Info
- [ ] Moderation Tools
    - [ ] Delete Posts/Comments
    - [ ] Ban Users
    - [ ] Lock Posts/Comments
    - [ ] Modify Posts (e.g. change title, mark as NSFW)
- [ ] Offline Features 
    - [ ] Content Cache
    - [ ] Upload when online
- [ ] Customization
    - [ ] User Themes
    - [ ] Compact Style (Like compact.reddit)
    - [ ] Classic Style (Like old.reddit)
- [ ] QoL Features
    - [ ] Auto-Register to other instances
    - [ ] Subscribe to the same community on multiple instances (like c/nemmy on Lemmy.world and Lemmy.ml)
    - [ ] Bulk Block/Hide Communities with the same or similar Name
    - [ ] Subscribe/Unsubscribe from Communities while in Search mode (So you don't need to leave the Search page just to unsubscribe/subscribe)
    - [ ] Improved Sorting

Ideas for Q4+
* Use GPT3.5 to sum up large text bodies
* Improve search Indexing of Posts
* Make every single feature of the App 100% usuable for Blind, deaf and color blind people
* Add a keyword ban (e.g. you don't want anything with "Beans" in your feed)
* Improve PWA Experience until it feels like a native app
* Think about making a native app

## License 
I'm going to keep it simple. These rules apply to this repo and all forks/clones.

### What you can do
* Fork this repo
* Change whatever you want
* Host it publicly (wether you made changes or not)
* Host it privately

### What you cannot do

#### Obvious stuff
* Pretend to be the original Nemmy Website
* Pretend to be me
* Add malicious code to your fork (like stealing User passwords)

#### Greed
* Charge money for features of Nemmy or Nemmy itself
* Hide Nemmy behind a paywall when you're hosting it
* Publish Nemmy (as a Native clone or PWA) on the IOS App Store, the Google Play Store, or any other App store
* Add Tracking/Analytics Services that are not GDPR compliant
* Try to sell or sell any User data
* Add ads to your fork
* Make a closed-source fork

## FOSS
* Nemmy will always be 100% Open Source, no strings attached.
* Nemmy will always be 100% free to use (I might start adding donation options if the Hosting Costs rise)


[contributors-shield]: https://img.shields.io/github/contributors/Cr4yfish/Nemmy.svg?style=for-the-badge
[contributors-url]: https://github.com/Cr4yfish/Nemmy/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Cr4yfish/Nemmy.svg?style=for-the-badge
[forks-url]: https://github.com/Cr4yfish/Nemmy/network/members
[stars-shield]: https://img.shields.io/github/stars/Cr4yfish/Nemmy.svg?style=for-the-badge
[stars-url]: https://github.com/Cr4yfish/Nemmy/stargazers
[issues-shield]: https://img.shields.io/github/issues/Cr4yfish/Nemmy.svg?style=for-the-badge
[issues-url]: https://github.com/Cr4yfish/Nemmy/issues
