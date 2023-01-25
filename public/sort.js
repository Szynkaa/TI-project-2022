this.addEventListener('message', function (e) {
    const moves = [];
    const array = [];
    fill(array, e.data.n);
    shuffle(array);
    switch (e.data.sortName) {
        case 'bubble':
            bubbleSort([...array], moves);
            break;
        case 'quick':
            quickSort([...array], moves);
            break;
        default:
            this.postMessage('uknnown');
            return;
    }
    this.postMessage({ array: array, moves: moves });
})

function fill(array, n) {
    for (let i = 1; i <= n; ++i) {
        array.push(i);
    }
}

// Fisher–Yates shuffle
function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

function bubbleSort(array, moves) {
    do {
        var swapped = false;
        for (let i = 1; i < array.length; ++i) {
            if (array[i - 1] > array[i]) {
                swapped = true;
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
                moves.push({ i: i - 1, j: i, swapped: true });
            } else {
                moves.push({ i: i - 1, j: i, swapped: false });
            }
        }
    } while (swapped);
}

function quickSort(array, moves) {
    quickSortImpl(array, 0, array.length - 1, moves);
}

function quickSortImpl(array, left, right, moves) {
    if (array.length > 1) {
        const index = partition(array, left, right, moves); // index returned from partition
        if (left < index - 1) { // more elements on the left side of the pivot
            quickSortImpl(array, left, index - 1, moves);
        }
        if (index < right) { // more elements on the right side of the pivot
            quickSortImpl(array, index, right, moves);
        }
    }
}

function partition(array, left, right, moves) {
    var pivotIndex = Math.floor((right + left) / 2); // middle element index
    const pivot = array[pivotIndex]; // middle element
    var i = left; // left pointer
    var j = right; // right pointer
    while (i <= j) {
        while (array[i] < pivot) {
            moves.push({ i: i, j: pivotIndex, swapped: false })
            i++;
        }
        if (i != pivotIndex) moves.push({ i: i, j: pivotIndex, swapped: false })

        while (array[j] > pivot) {
            moves.push({ i: pivotIndex, j: j, swapped: false })
            j--;
        }
        if (j != pivotIndex) moves.push({ i: pivotIndex, j: j, swapped: false })

        if (i <= j) {
            [array[i], array[j]] = [array[j], array[i]];

            if (i != j) moves.push({ i: i, j: j, swapped: true });

            if (i == pivotIndex)
                pivotIndex == j;
            else if (j == pivotIndex)
                pivotIndex = i;

            i++;
            j--;
        }
    }
    return i;
}
