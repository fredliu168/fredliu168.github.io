---
title: 显示来自远程JSON文件的SwiftUI列表
date: 2020-05-07 10:01:40
tags:
---

Displaying a List with SwiftUI from a remote JSON file

显示来自远程 JSON 文件的 SwiftUI 列表

The purpose of this tutorial is to show a simple way to fetch data from a remote JSON file and display it on a List in SwiftUI. Apple has a tutorial with a local file, also this one teaches you how to do this, however I want to show a simpler way using a newer version of Xcode 11.0 (11A420a).

本教程的目的是展示一种从远程 JSON 文件中获取数据并将其显示在 SwiftUI 的 List 中的简单方法。 苹果有一个本地文件的教程，也教你如何做到这一点，但我想显示一个更简单的方式使用新版本的 Xcode 11.0(11A420a)。

Apple beta libraries are getting constantly changed before releasing the final versions, so older tutorials might not work on the latest versions of XCode

在发布最终版本之前，苹果的测试版本库会不断更新，所以以前的教程可能无法在最新版本的 XCode 上工作

Supposing we have this JSON file, that show an array of movie titles.

假设我们有这个 JSON 文件，它显示一组电影标题。

```json
[
  {
    "id": 5,
    "title": "Joker",
    "year": "2019",
    "image": "",
    "created_at": "2019-10-06T17:55:21.374Z",
    "updated_at": "2019-10-06T17:55:21.374Z"
  },
  {
    "id": 1,
    "title": "Pulp Fiction",
    "year": "1994",
    "image": "",
    "created_at": "2019-10-06T15:26:36.675Z",
    "updated_at": "2019-10-06T18:05:31.649Z"
  },
  {
    "id": 4,
    "title": " The Godfather ",
    "year": "1972",
    "image": "",
    "created_at": "2019-10-06T15:27:38.123Z",
    "updated_at": "2019-10-06T18:05:50.242Z"
  },
  {
    "id": 6,
    "title": "The Dark Knight ",
    "year": "2008",
    "image": "",
    "created_at": "2019-10-06T18:06:12.933Z",
    "updated_at": "2019-10-06T18:06:12.933Z"
  },
  {
    "id": 7,
    "title": "Fight Club",
    "year": "1999",
    "image": "",
    "created_at": "2019-10-06T18:06:33.096Z",
    "updated_at": "2019-10-06T18:06:33.096Z"
  },
  {
    "id": 8,
    "title": " Inception",
    "year": "2010",
    "image": "",
    "created_at": "2019-10-06T18:06:52.034Z",
    "updated_at": "2019-10-06T18:06:52.034Z"
  },
  {
    "id": 2,
    "title": "The Matrix ",
    "year": "1999",
    "image": "",
    "created_at": "2019-10-06T15:26:48.042Z",
    "updated_at": "2019-10-06T18:08:00.902Z"
  },
  {
    "id": 3,
    "title": "The Shawshank Redemption ",
    "year": "1984",
    "image": "",
    "created_at": "2019-10-06T15:26:59.572Z",
    "updated_at": "2019-10-06T18:08:47.637Z"
  }
]
```

And we want to display them on a SwiftUI List like this.

我们希望像这样在 SwiftUI 列表中显示它们。

{% asset_img swift_list.png This is an image %}

First we need to define the model for Movie in this case a struct with Decodable and Identifiable protocols. Decodable to be able to decode it from the JSON file and Identifiable to be able to be listed with List. List allows you to display a list of data from an Identifiable Collection just like a UITableViewController.

首先，在这种情况下，我们需要为 Movie 定义一个具有可解码和可识别协议的结构。 可解码能够从 JSON 文件解码，可识别能够与列表一起列出。 List 允许您像 UITableViewController 一样显示可识别集合中的数据列表。

```swift
struct Movie: Decodable, Identifiable {
    public var id: Int
    public var name: String
    public var released: String

    enum CodingKeys: String, CodingKey {
           case id = "id"
           case name = "title"
           case released = "year"
        }
}
```

<!-- more -->

CodingKeys basically maps the JSON key names with the variable name of the Model you created. In this case instead of year I named it released just for the purpose of showing that you can use your own names in the model as long as you define it in Coding Keys.
Codingkeys

基本上将 JSON 键名与您创建的 Model 的变量名映射在一起。 在本例中，我将其命名为 released，而不是年份，只是为了显示您可以在模型中使用自己的名称，只要您在 Coding Keys 中定义它。

Next we create the fetcher class that will load the JSON file and decode it.

接下来，我们创建 fetcher 类，它将加载 JSON 文件并对其进行解码。

```swift
public class MovieFetcher: ObservableObject {
    @Published var movies = [Movie]()

    init(){
        load()
    }

    func load() {
        let url = URL(string: "https://gist.githubusercontent.com/rbreve/60eb5f6fe49d5f019d0c39d71cb8388d/raw/f6bc27e3e637257e2f75c278520709dd20b1e089/movies.json")!

        URLSession.shared.dataTask(with: url) {(data,response,error) in
            do {
                if let d = data {
                    let decodedLists = try JSONDecoder().decode([Movie].self, from: d)
                    DispatchQueue.main.async {
                        self.movies = decodedLists
                    }
                }else {
                    print("No Data")
                }
            } catch {
                print ("Error")
            }

        }.resume()

    }
}
```

Before understanding what is happening, we need to understand the new Combine framework.

在理解正在发生的事情之前，我们需要理解新的组合框架。

The Combine framework provides a declarative Swift API for processing values over time. These values can represent many kinds of asynchronous events. Combine declares publishers to expose values that can change over time, and subscribers to receive those values from the publishers.

组合框架提供了一个声明性的 Swift API，用于随着时间的推移处理值。 这些值可以表示多种异步事件。 组合声明发布者以公开可能随时间变化的值，订阅者从发布者处接收这些值。

ObervableObject: A type of object with a publisher that emits before the object has changed. By default an ObservableObject synthesizes an objectWillChange publisher that emits the changed value before any of its @Published properties changes.
Obervableobject:

具有发行者的对象类型，在对象更改之前发出该对象。 默认情况下，ObservableObject 合成一个 objectWillChange 发布者，该发布者在其@published 属性更改之前发出更改的值。

@Published wraps the movies array and will generate events whenever it is changed.

@ published 对 movies 数组进行封装，并在更改时生成事件。

The load() method fetches the JSON data from the network asynchronously, once the data has been loaded we assign it to movies. When movies changes it will send an event a subscriber.

Load ()方法从网络中异步获取 JSON 数据，一旦数据被加载，我们就将其分配给电影。 当电影发生变化时，它会向订阅者发送一个事件。

This is the SwiftUI view, a List with the ObservedObject fetcher as parameter. Whenever movies is updated, the list will update autmatically.

这是 SwiftUI 视图，一个带有 ObservedObject 提取程序作为参数的 List。 每当电影更新时，列表将自动更新。

```swift
struct ContentView: View {
    @ObservedObject var fetcher = MovieFetcher()

    var body: some View {
        VStack {
            List(fetcher.movies) { movie in
                VStack (alignment: .leading) {
                    Text(movie.name)
                    Text(movie.released)
                        .font(.system(size: 11))
                        .foregroundColor(Color.gray)
                }
            }
        }
    }
}
```

The whole code is here.

整个代码都在这里。

```swift
//
//  FetchView.swift
//
//  Created by Roberto Breve  on 4.10.2019.
//  Copyright © 2019 Roberto Breve . All rights reserved.
//
import Foundation
import SwiftUI
import Combine


struct FetchView: View {
    @ObservedObject var fetcher = MovieFetcher()

    var body: some View {
        VStack {
            List(fetcher.movies) { movie in
                VStack (alignment: .leading) {
                    Text(movie.name)
                    Text(movie.released)
                        .font(.system(size: 11))
                        .foregroundColor(Color.gray)
                }
            }
        }
    }
}



public class MovieFetcher: ObservableObject {

    @Published var movies = [Movie]()

    init(){
        load()
    }

    func load() {
        let url = URL(string: "https://gist.githubusercontent.com/rbreve/60eb5f6fe49d5f019d0c39d71cb8388d/raw/f6bc27e3e637257e2f75c278520709dd20b1e089/movies.json")!

        URLSession.shared.dataTask(with: url) {(data,response,error) in
            do {
                if let d = data {
                    let decodedLists = try JSONDecoder().decode([Movie].self, from: d)
                    DispatchQueue.main.async {
                        self.movies = decodedLists
                    }
                }else {
                    print("No Data")
                }
            } catch {
                print ("Error")
            }

        }.resume()

    }
}

struct Movie: Codable, Identifiable {
    public var id: Int
    public var name: String
    public var released: String

    enum CodingKeys: String, CodingKey {
           case id = "id"
           case name = "title"
           case released = "year"
        }
}
```

文章来自：https://medium.com/@rbreve/displaying-a-list-with-swiftui-from-a-remote-json-file-6b4e4280a076
WRITTEN BY 原文作者:
Roberto Breve 罗伯托 · 布雷夫
