#  FMRWEB.RES is the key definition file for webforms. The syntax is:
#
#    JFN : JMN : URKS : FFN : URFD   (whitespace ignored)
#
#      JFN = Java function number
#      JMN = Java modifiers number
#     URKS = User-readable key sequence (double-quoted)
#      FFN = Forms function number
#     URFD = User-readable function description (double-quoted)
#
#  JAVA FUNCTION NUMBER
#         33 = PageUp
#         34 = PageDown
#         35 = End
#         36 = Home
#         37 = LeftArrow
#         38 = UpArrow
#         39 = RightArrow
#         40 = DownArrow
#    65 - 90 = Ctrl+A thru Ctrl+Z (These will always have the control
#              modifier explicitly included, as well as any other
#              modifiers that might be used.)
#  112 - 123 = F1 thru F12
#          9 = Tab (Ctrl+I, without the control modifier)
#         10 = Return (Ctrl+J, without the control modifier)
#
#  JAVA MODIFIERS NUMBER
#  Equal to the sum of the values for the modifier keys:
#    0 = None
#    1 = Shift
#    2 = Control
#    4 = Meta
#    8 = Alt
#
#  FORMS FUNCTION NUMBER
#  The Forms function numbers match the function numbers found in a
#  typical Forms key binding file.
#
#  USER-READABLE STRINGS 
#  The double-quoted strings appear when users click [Show Keys], and
#  are used for this purpose only. These strings can be translated as
#  needed. Note that the strings do not affect what actually happens
#  when end users press a particular key sequence.
#

9    : 0 : "Tab"            : 1  : "Next Field"
9    : 1 : "Shift+Tab"      : 2  : "Previous Field"
#116  : 0 : "F5"            : 3  : "Clare Field"
116  : 0 : "F5"             : 70 : "Find Data"
38   : 0 : "Up"             : 68 : "Previous Record"
40   : 0 : "Down"           : 67 : "Next Record"
#38   : 0 : "Up"             : 6  : "Up"
#40   : 0 : "Down"           : 7  : "Down"
33   : 0 : "PageUp"         : 12 : "PageUp"
34   : 0 : "PageDown"       : 13 : "PageDown"

115  : 0 : "F4"             : 64 : "New Record From"
117  : 0 : "F6"             : 65 : "New Record"
113  : 0 : "F2"             : 84 : "Update Record"
117  : 1 : "Shift+F6"       : 63 : "Delete Record"
49   : 2 : "Ctrl+1"         : 11023 : "First Record"
76   : 2 : "Ctrl+L"         : 11022 : "Last Record"


123  : 0 : "F12"            : 36 : "Save"
78   : 2 : "Ctrl+N"         : 11025 : "New Screen"
76   : 8 : "Alt+L"         : 11026 : "Lock Screen"

80   : 2 : "Ctrl+P"         : 79  : "Print"
85   : 2 : "Ctrl+U"         : 69 : "Undo"
27   : 0 : "Esc"            : 32 : "Exit"
81   : 2 : "Ctrl+Q"         : 32 : "Exit"


#82  : 2 : "Ctrl+R"         : 11028 : "Related Screens"
84   : 2 : "Ctrl+T"         : 11029 : "Tree Screen"
#116  : 0 : "F5"             : 11027 : "Favorite Screens"



65   : 8 : "Alt+A"          : 11043 : "Approve Screen"
82   : 8 : "Alt+R"          : 11040 : "Archive Screen"
77   : 8 : "AlT+M"          : 11041 : "Parameters Screen"
74   : 8 : "Alt+J"          : 11030 : "Journal View Screen"
72   : 8 : "Alt+H"          : 11031 : "Audit Screen"
67   : 8 : "Alt+C"          : 11039 : "Cancel Document Screen"
86   : 8 : "Alt+V"          : 11042 : "Verify Screen"
80   : 8 : "Alt+P"          : 11032 : "Posting Screen"
83   : 8 : "Alt+S"          : 11044 : "Suspend Document Screen"
78   : 8 : "Alt+N"          : 11045 : "Inactive Document Screen"

70   : 2 : "Ctrl+F"          : 82: "Data Search"


68   : 2 : "Ctrl+D"         : 11033 : "Add Order"
40   : 2 : "Ctrl+Down"      : 11034 : "Desc Order"
38   : 2 : "Ctrl+Up"        : 11035 : "Asc Order"
82   : 2 : "Ctrl+R"       : 11036 : "Cancel Order"
73   : 8 : "Alt+I"        : 85: "Input Screen"
84   : 8 : "Alt+T"        : 86: "Trans Screen"


118  : 0 : "F7"             : 76 : "Enter Query"
119  : 0 : "F8"             : 77 : "Exe Query"
116  : 0 : "F5"             : 70 : "Find Data"




69   : 2 : "Ctrl+E"         : 22 : "Edit"
67   : 2 : "Ctrl+C"         : 22 : "Copy"
80   : 2 : "Ctrl+P"         : 22 : "Past"
88   : 2 : "Ctrl+X"         : 22 : "Cut"




#33   : 0 : "PageUp"         : 12 : "Record Page Up"
#34   : 0 : "PageDown"       : 13 : "≈Record Page Down"
#69   : 2 : "Ctrl+E"         : 22 : "Edit"
10   : 0 : "Return"         : 27 : "ÒReturn"
120  : 0 : "F9"             : 29 : "List Of Value"
112  : 2 : "Ctrl+F1"        : 35 : "Show Keys"
114  : 1 : "Shift+F3"       : 61 : "Next Pk "
113  : 1 : "Shift+F2"       : 80 : "Query Count"
34   : 2 : "Ctrl+PageDown"  : 71 : "Page Down"
33   : 2 : "Ctrl+PageUp"    : 72 : "Page Up"
112  : 1 : "Shift+F1"       : 78 : "Show Error"
84   : 3 : "Shift+Ctrl+T"   : 95 : "Show Tab Page"
112  : 0 : "F1"             : 30 : "Help"
34   : 3 : "Shift+Ctrl+PageDown"  : 66 : "Net Set Of record"

114   : 0 : "F3"             : 73 : "Duplicate Field"
#115  : 1 : "Shift+F4"       : 62 : "Clear REcord"
#38   : 1 : "Shift+Up"       : 68 : "Previous Record"
#40   : 1 : "Shift+Down"     : 67 : "Next  Record"
#85   : 2 : "Ctrl+U"         : 81 : "Update Record"
#SAW
121  : 0 : "F10"             : 62 : "F10"
70   : 8 : "Alt+F"           : 11048 : "Advance Search"
#116  : 0 : "F5"             : 70 : "Query Reord"
#118  : 1 : "Shift+F7"       : 74 : "Clear form"
#119: 1 : "Shift+F8"       : 79 : "Print"
121  : 3 : "Shift+Ctrl+F10" : 82 : "Job0"
112  : 3 : "Shift+Ctrl+F1"  : 83 : "Job1"
113  : 3 : "Shift+Ctrl+F2"  : 84 : "Job2"
114  : 3 : "Shift+Ctrl+F3"  : 85 : "Job3"
115  : 3 : "Shift+Ctrl+F4"  : 86 : "Job4"
116  : 3 : "Shift+Ctrl+F5"  : 87 : "Job5"
117  : 3 : "Shift+Ctrl+F6"  : 88 : "Job6"
118  : 3 : "Shift+Ctrl+F7"  : 89 : "Job7"
119  : 3 : "Shift+Ctrl+F8"  : 90 : "Job8"
120  : 3 : "Shift+Ctrl+F9"  : 91 : "Job9"
#113  : 0 : "F2"             : 95 : "Show Page Tabs"
#72   : 2 : "Ctrl+H"         : 30 : "Help"
#121  : 0 : "F10"            : 36 : "Save"

