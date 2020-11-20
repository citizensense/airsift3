from django.shortcuts import render
import requests

from airsift.dustboxes.data import DustboxReadings

def dustboxes(request):
    data = DustboxReadings.load()

    '''
    Example item
    {
        "createdAt": 1605710659907,
        "description": "test",
        "deviceNumber": "test",
        "entriesNumber": 0,
        "id": "b786c4e9-6729-40fc-b0a0-70aec4cc8d40",
        "lastEntryAt": {
            "timestamp": "never",
            "human": "Invalid Date"
        },
        "location": {
            "longitude": "-0.6989764",
            "latitude": "52.2552717"
        },
        "publicKey": "QORmT5sspdFUpuEO",
        "slug": "test",
        "tags": [],
        "title": "test 2",
        "updatedAt": 1605712216548
    },
    '''
    return render(request, 'dustboxes/dustboxes.html', {
        "dustboxes": data
    })


'''
{
  "status": 200,
  "data": [
    {
      "createdAt": 1605710659907,
      "description": "test",
      "deviceNumber": "test",
      "entriesNumber": 0,
      "id": "b786c4e9-6729-40fc-b0a0-70aec4cc8d40",
      "lastEntryAt": { "timestamp": "never", "human": "Invalid Date" },
      "location": { "longitude": "-0.9732284", "latitude": "52.0767277" },
      "publicKey": "QORmT5sspdFUpuEO",
      "slug": "test",
      "tags": [],
      "title": "test 2",
      "updatedAt": 1605712216548
    },
    {
      "createdAt": 1605643616692,
      "description": "bla bla bla",
      "deviceNumber": None,
      "entriesNumber": 0,
      "id": "e7e361a5-897a-416a-890b-62c85871f724",
      "lastEntryAt": { "timestamp": "never", "human": "Invalid Date" },
      "location": { "longitude": "-2.3082590", "latitude": "56.7323620" },
      "publicKey": "f9JXYSfsYDOXzPJs",
      "slug": "test-1",
      "tags": [],
      "title": "Test 1",
      "updatedAt": 1605712990379
    },
    {
      "createdAt": 1587078435477,
      "description": "Dustbox_0015",
      "deviceNumber": "0015",
      "entriesNumber": 30052,
      "id": "3f33ae4f-3a72-48dd-a6ce-7e5f5358db52",
      "lastEntryAt": { "timestamp": 1594125745605, "human": "7-7-2020" },
      "location": { "longitude": "19.4560410", "latitude": "48.0608420" },
      "publicKey": "Tt9HaHTmxlvbU3B9",
      "slug": "0015",
      "tags": [],
      "title": "Dustbox_0015",
      "updatedAt": 1603345039491
    },
    {
      "createdAt": 1587078424191,
      "description": "Dustbox_0014",
      "deviceNumber": "0014",
      "entriesNumber": 4450,
      "id": "189f3110-f833-42d7-a0df-9cb20788efb3",
      "lastEntryAt": { "timestamp": 1588174165977, "human": "4-29-2020" },
      "location": {},
      "publicKey": "1rzfIbBWbqGsfqlB",
      "slug": "0014",
      "tags": [],
      "title": "Dustbox_0014"
    },
    {
      "createdAt": 1587078389176,
      "description": "Dustbox_0013",
      "deviceNumber": "0013",
      "entriesNumber": 4216,
      "id": "bd2bf539-a341-4059-9de5-16f11d18ac1b",
      "lastEntryAt": { "timestamp": 1587716788726, "human": "4-24-2020" },
      "location": {},
      "publicKey": "2WlAzxQq95GF5Vv0",
      "slug": "0013",
      "tags": [],
      "title": "Dustbox_0013"
    },
    {
      "createdAt": 1587078374762,
      "description": "Dustbox_0012",
      "deviceNumber": "0012",
      "entriesNumber": 5367,
      "id": "5ea6bd83-93fc-4d00-a498-2dff7def357f",
      "lastEntryAt": { "timestamp": 1587463105979, "human": "4-21-2020" },
      "location": {},
      "publicKey": "P8rCnVidBPaSYnKz",
      "slug": "0012",
      "tags": [],
      "title": "Dustbox_0012"
    },
    {
      "createdAt": 1587078360363,
      "description": "Dustbox_0011",
      "deviceNumber": "0011",
      "entriesNumber": 5362,
      "id": "9f543e7b-7e0f-4582-a1af-6df790219027",
      "lastEntryAt": { "timestamp": 1587463105838, "human": "4-21-2020" },
      "location": {},
      "publicKey": "0GcdEqa96x1LHYz0",
      "slug": "0011",
      "tags": [],
      "title": "Dustbox_0011"
    },
    {
      "createdAt": 1587078344018,
      "description": "Dustbox_0010",
      "deviceNumber": "0010",
      "entriesNumber": 419,
      "id": "b15b265f-2d00-4739-9cf9-2898aa1ebb4d",
      "lastEntryAt": { "timestamp": 1587165745422, "human": "4-17-2020" },
      "location": {},
      "publicKey": "MUjrhmK9gCvJFo5G",
      "slug": "0010",
      "tags": [],
      "title": "Dustbox_0010"
    },
    {
      "createdAt": 1587078326583,
      "description": "Dustbox_0009",
      "deviceNumber": "0009",
      "entriesNumber": 419,
      "id": "acc05256-1cec-4801-88dd-739e1111d99c",
      "lastEntryAt": { "timestamp": 1587165745271, "human": "4-17-2020" },
      "location": {},
      "publicKey": "p2caCGG9LeN6UgD0",
      "slug": "0009",
      "tags": [],
      "title": "Dustbox_0009"
    },
    {
      "createdAt": 1587042125068,
      "description": "Dustbox_0008",
      "deviceNumber": "0008",
      "entriesNumber": 299,
      "id": "c7f750b5-605e-4063-9f0e-0813921a25f7",
      "lastEntryAt": { "timestamp": 1587064645914, "human": "4-16-2020" },
      "location": {},
      "publicKey": "1dWAblY50EUj30fM",
      "slug": "0008",
      "tags": [],
      "title": "Dustbox_0008"
    },
    {
      "createdAt": 1587042106046,
      "description": "Dustbox_0007",
      "deviceNumber": "0007",
      "entriesNumber": 51657,
      "id": "d71acb8f-93f9-40e0-bbbb-0d52a11dfa11",
      "lastEntryAt": { "timestamp": 1597766906323, "human": "8-18-2020" },
      "location": {},
      "publicKey": "c1j9qoSyw8oRtTJK",
      "slug": "0007",
      "tags": [],
      "title": "Dustbox_0007"
    },
    {
      "createdAt": 1587042091871,
      "description": "Dustbox_0006",
      "deviceNumber": "0006",
      "entriesNumber": 178149,
      "id": "e4281b96-c83e-4b75-a3f8-623467c206ec",
      "lastEntryAt": { "timestamp": 1605356725545, "human": "11-14-2020" },
      "location": {},
      "publicKey": "Re6RVOuJw0liLcDk",
      "slug": "0006",
      "tags": [],
      "title": "Dustbox_0006"
    },
    {
      "createdAt": 1586953700938,
      "description": "Dustbox_0005",
      "deviceNumber": "0005",
      "entriesNumber": 411,
      "id": "28df2dc2-a03d-4b7b-9a85-ac95d9c084a9",
      "lastEntryAt": { "timestamp": 1586981006524, "human": "4-15-2020" },
      "location": {},
      "publicKey": "CTlu4vzvJLXLIuWi",
      "slug": "0005",
      "tags": [],
      "title": "Dustbox_0005"
    },
    {
      "createdAt": 1586896896296,
      "description": "Dustbox_0004",
      "deviceNumber": "0004",
      "entriesNumber": 412,
      "id": "bd8d2e43-0e5d-4beb-bcf3-2ec7f24abab7",
      "lastEntryAt": { "timestamp": 1586981066010, "human": "4-15-2020" },
      "location": {},
      "publicKey": "JHlR7dWXvqRPvaJB",
      "slug": "0004",
      "tags": [],
      "title": "Dustbox_0004"
    },
    {
      "createdAt": 1586896876849,
      "description": "Dustbox_0003",
      "deviceNumber": "0003",
      "entriesNumber": 2247,
      "id": "ee437d38-8fb0-4b87-924a-55ede91f76e3",
      "lastEntryAt": { "timestamp": 1597767325622, "human": "8-18-2020" },
      "location": {},
      "publicKey": "ie1HnpK3bwJAPQfC",
      "slug": "0003",
      "tags": [],
      "title": "Dustbox_0003"
    },
    {
      "createdAt": 1586896845810,
      "description": "Dustbox_0002",
      "deviceNumber": "0002",
      "entriesNumber": 293,
      "id": "48feb442-1b99-49a0-a123-30f02ea09117",
      "lastEntryAt": { "timestamp": 1586956226645, "human": "4-15-2020" },
      "location": {},
      "publicKey": "102dqCBqMpo2QLgf",
      "slug": "0002",
      "tags": [],
      "title": "Dustbox_0002"
    },
    {
      "createdAt": 1578585169713,
      "description": "Dustbox_2063",
      "deviceNumber": "2063",
      "entriesNumber": 250610,
      "id": "427f859e-717c-4866-b683-3c95761324f1",
      "lastEntryAt": { "timestamp": 1601054725417, "human": "9-25-2020" },
      "location": {},
      "publicKey": "QlX0DH06WzqFdVSgKVJDl7bh2C0",
      "slug": "dustbox-2063 test",
      "tags": [],
      "title": "Dustbox_2063 Test",
      "updatedAt": 1599570105681
    },
    {
      "createdAt": 1578579715028,
      "description": "Dustbox_2055",
      "deviceNumber": "2055",
      "entriesNumber": 220472,
      "id": "1c2253af-a82a-4365-a6b1-7d133c01e697",
      "lastEntryAt": { "timestamp": 1601054725517, "human": "9-25-2020" },
      "location": {},
      "publicKey": "xi5qfyT5nR5mD7GAZwUTL1rsDTq",
      "slug": "dustbox-2055",
      "tags": [],
      "title": "Dustbox_2055",
      "updatedAt": 1599571344477
    },
    {
      "createdAt": 1578496273440,
      "description": "Dustbox_2052",
      "deviceNumber": "2052",
      "entriesNumber": 225460,
      "id": "d901ec2a-7fc3-45a2-8ab3-4ee1c87d99c4",
      "lastEntryAt": { "timestamp": 1601054725781, "human": "9-25-2020" },
      "location": {},
      "publicKey": "JS6yj2s20vwtTtzWDpWQZgkNMgx",
      "slug": "dustbox-2052",
      "tags": [],
      "title": "Dustbox_2052",
      "updatedAt": 1599570937947
    },
    {
      "createdAt": 1578487688896,
      "description": "Dustbox_2049",
      "deviceNumber": "2049",
      "entriesNumber": 18830,
      "id": "85ed37fb-6572-4866-9133-82538f684aaf",
      "lastEntryAt": { "timestamp": 1581370225609, "human": "2-10-2020" },
      "location": {},
      "publicKey": "ivvCYG75b5ogjbwI3YBhDhyZbFN",
      "slug": "dustbox-2049",
      "tags": [],
      "title": "Dustbox_2049",
      "updatedAt": 1596988094001
    },
    {
      "createdAt": 1578413367221,
      "description": "Dustbox_0001",
      "deviceNumber": "0001",
      "entriesNumber": 124303,
      "id": "836ad862-b50f-43a9-8861-4c2f178f2297",
      "lastEntryAt": { "timestamp": 1605889766136, "human": "11-20-2020" },
      "location": { "longitude": "-0.0135560", "latitude": "51.7445880" },
      "publicKey": "B8lMpY6gCyUi6KUS",
      "slug": "0001",
      "tags": [],
      "title": "Dustbox_0001",
      "updatedAt": 1603359901722
    },
    {
      "createdAt": 1578410784084,
      "description": "Dustbox_2048",
      "deviceNumber": "2048",
      "entriesNumber": 40439,
      "id": "ce8e43fb-0df7-419b-88f8-8855776a1224",
      "lastEntryAt": { "timestamp": 1594372226471, "human": "7-10-2020" },
      "location": {},
      "publicKey": "IS4QT6VioSCcISSM7ufmVcPuSLB",
      "slug": "dustbox-2048",
      "tags": [],
      "title": "Dustbox_2048",
      "updatedAt": 1596987873974
    },
    {
      "createdAt": 1575973156128,
      "description": "Test in Leeds.",
      "deviceNumber": "10001",
      "entriesNumber": 0,
      "id": "8b76f05f-a8bd-4f5b-83e9-b37599ec3979",
      "lastEntryAt": { "timestamp": "never", "human": "Invalid Date" },
      "location": {},
      "publicKey": "Jh9QYOPzTR051tUM",
      "slug": "ridge_grove",
      "tags": [],
      "title": "Ridge_Grove"
    },
    {
      "createdAt": 1574163378145,
      "description": "test stream",
      "deviceNumber": "0016",
      "entriesNumber": 5901,
      "id": "857f568b-c9dc-46e2-a54c-2969e2e3c67b",
      "lastEntryAt": { "timestamp": 1597323626026, "human": "8-13-2020" },
      "location": {},
      "publicKey": "YGDBRSWRlSpvfUFw",
      "slug": "test1",
      "tags": [],
      "title": "Dustbox_0016",
      "updatedAt": 1594320905351
    },
    {
      "createdAt": 1574054625762,
      "description": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",
      "deviceNumber": "12345",
      "entriesNumber": 0,
      "id": "975961c9-5805-4e2c-b938-f7993ca2dfb6",
      "lastEntryAt": { "timestamp": "never", "human": "Invalid Date" },
      "location": {},
      "publicKey": "Z350F3q6SQ24G5yP",
      "slug": "stream1",
      "tags": [],
      "title": "Stream 1"
    },
    {
      "createdAt": 1572437314608,
      "description": "Issues with crashing, it is sad. No delays on this board, uses done flag. Hopefully this will improve timing issues. The NTP clock only resets on startup.",
      "deviceNumber": "00012",
      "entriesNumber": 0,
      "id": "faa47cd0-f91e-45ad-a0ca-aae1fa4cd30d",
      "lastEntryAt": { "timestamp": 1575293005490, "human": "12-2-2019" },
      "location": {},
      "publicKey": "mchBQbZeeNwrOeV4u5nseYhv4cG",
      "slug": "dustbox2-0-alpha001",
      "tags": [],
      "title": "Dustbox2.0_Alpha001",
      "updatedAt": 1575293504987
    },
    {
      "createdAt": 1572354221610,
      "description": "Using UNIX counter from 0",
      "deviceNumber": "00007",
      "entriesNumber": 0,
      "id": "57512164-87fe-4880-ac07-86dee10868c3",
      "lastEntryAt": { "timestamp": 1575292934878, "human": "12-2-2019" },
      "location": {},
      "publicKey": "MPbsESyMSFo6UnGQmIaMQ9hBFEn",
      "slug": "dustbox2-0-no_time_update",
      "tags": [],
      "title": "Dustbox2.0_No_Time_Update",
      "updatedAt": 1575292967167
    },
    {
      "createdAt": 1572353059761,
      "description": "NTP called once",
      "deviceNumber": "00006",
      "entriesNumber": 0,
      "id": "87041d01-e088-4c33-89fb-89b162bc71ef",
      "lastEntryAt": { "timestamp": 1575292881126, "human": "12-2-2019" },
      "location": {},
      "publicKey": "KENT1FOqJUiJYMtLsWroIIhO6c3",
      "slug": "dustbox-2-0_timer_no_update",
      "tags": [],
      "title": "Dustbox_2.0_Timer_No_Update",
      "updatedAt": 1575292895435
    },
    {
      "createdAt": 1571820088579,
      "description": "A Dustbox using NTP timer to collect data.",
      "deviceNumber": "00004",
      "entriesNumber": 0,
      "id": "f2551fae-aca8-40dd-a85b-4cf5cd386b81",
      "lastEntryAt": { "timestamp": 1575292821084, "human": "12-2-2019" },
      "location": {},
      "publicKey": "bc2qx7Tkc45Win166pSp3RkKKwt",
      "slug": "dustbox2-0-timer_001",
      "tags": [],
      "title": "Dustbox2.0_Timer_001",
      "updatedAt": 1575292851111
    },
    {
      "createdAt": 1570540849428,
      "description": "Raspberry Pi Prototype Dustbox2.0",
      "deviceNumber": "1",
      "entriesNumber": 0,
      "id": "1dbb7a58-0f48-415b-bdbe-5703ba1e251f",
      "lastEntryAt": { "timestamp": 1575292353723, "human": "12-2-2019" },
      "location": {},
      "publicKey": "ypVRjv7rUVrWKuH1SkwiLljcpMF",
      "slug": "dustbox2-0-piprototype",
      "tags": [],
      "title": "Dustbox2.0_PiPrototype",
      "updatedAt": 1575292164938
    }
  ]
}
'''
