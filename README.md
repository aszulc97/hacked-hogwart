# Hacked Hogwarts Student List

The solution displays a list of students that can be sorted and filtered. Moreover you can search for a student name or surname using search box. Whenever you click on one of the students, you can see a popup window with more details and buttons - expel, make a prefect and add to inqu squad. The popup is decorated with the house crest and colors of the selected student.

## Expelling students
When you click on 'expel' button, the student will be expelled from school. This removes a student from the list of students, and adds it to another list of expelled students. Once expelled, a student cannot return to the original list.

## Prefects
When you click on 'make a prefect' button, the student will become a prefect. Only two students from each house can be selected prefects. You can revoke the prefect-status at any time using the 'remove' buttons on prefect list (on the right side of main page).

## Inquisitorial Squad
When you click on 'add to inqu squad' button, the student will be added to Inquisitorial squad, but only if the meet requirements. Only pure-blood or students from Slytherin can be members of the squad. Any number of students can be appointed. You can remove a student from Inquisitorial Squad by using 'remove' button.

## Blood-status
The system calculates blood-status for each student. This is an indication of whether the student is from a pure wizarding family, or from a half-wizard, half-muggle family, or just plain muggle. It is done using a provided list of all known pure-blooded wizarding families, as well as a list of some of the known half-bloods. 

## Hacking
You can hack the system. 
Hacking results in three things happening:

1. I (Agata Szulc) am injected into the list of students and I cannot be expelled.
2. The blood-status is no longer thrustworthy. Former pure-bloods get completely random blood-status, whereas half- and muggle-bloods are listed as pure-blood.
3. Adding a student to the inquisitorial squad only works for a limited time, before the student is automatically removed again.

## How to hack?
You have to find a student with no last name (Leanne), open a pop-up window for her and double-click on her picture (that says “no portrait").

Or you can write ```hackTheSystem()``` inside in-browser console.

https://aszulc97.github.io/hacked-hogwart/
