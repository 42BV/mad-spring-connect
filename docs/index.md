---
layout: guide
title: Guide
nav_order: 0
description: 'Documentation for @42.nl/spring-connect.'
has_children: true
permalink: /
next:
  url: installation
  name: Installation
---

[![Build Status](https://travis-ci.org/42BV/mad-spring-connect.svg?branch=master)](https://travis-ci.org/42BV/mad-spring-connect)
[![Codecov](https://codecov.io/gh/42BV/mad-spring-connect/branch/master/graph/badge.svg)](https://codecov.io/gh/42BV/mad-spring-connect)

This library makes it easy to create a Resource to connect to a [Spring MVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/html/mvc.html) back-end.

## Philosophy

The idea of this library is not to provide you with a cookie cutter
way of defining resources, but instead make it easy to define your own
type of resource, **_in code_**.

The reason for this is simple: every resource is different, every resource
has its own properties and custom methods. Trying to catch all these
differences via a _configuration_ based API is **_impossible_**. Using
code is more natural and easier to understand.

Therefore `@42.nl/spring-connect` allows you to define a Resource, with
some bells and whistles, but allows you to customize it in code.

We have a guide which shows you all the features:

First: [Install the library](https://42bv.github.io/mad-spring-connect/installation) 